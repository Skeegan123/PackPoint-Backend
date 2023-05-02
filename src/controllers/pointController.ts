import { NextFunction, Request, Response } from "express";
import db from "../config/db";
import logger from "../utils/logger";
import { BlobServiceClient } from "@azure/storage-blob";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const upload = multer({ storage: multer.memoryStorage() });

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING as string;
const CONTAINER_NAME = process.env.CONTAINER_NAME as string;

const uploadImageToBlobStorage = async (file: Express.Multer.File): Promise<string> => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
  const blockBlobClient = containerClient.getBlockBlobClient(uuidv4() + ".jpg"); // Use the correct file extension for your image

  await blockBlobClient.uploadData(file.buffer, { blobHTTPHeaders: { blobContentType: file.mimetype } });

  return blockBlobClient.url;
};

export const getAllPoints = async (req: Request, res: Response, next: NextFunction) => {
  logger.info("Fetching all points");
  try {
    const points = await db.any("SELECT * FROM points");
    if (points.length === 0) {
      res.status(404).json({ message: "No points found" });
      logger.info("No points found");
    } else {
      res.status(200).json(points);
      logger.info("Fetched all points");
    }
  } catch (error) {
    logger.error("Failed to fetch points from the database: " + error);
    next(error);
  }
};

export const getPointsByUserId = async (req: Request, res: Response, next: NextFunction) => {
  logger.info(`Fetching points for uid: ${req.uid}`);
  try {
    const points = await db.any(
      "SELECT id, name, description, rating, noise_level, busy_level, wifi, amenities, address, ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng, firebase_uid, image_url FROM points WHERE firebase_uid = $1",
      [req.uid]
    );
    if (points.length === 0) {
      res.status(404).json({ message: `No points found for uid: ${req.uid}` });
      logger.info(`No points found for uid: ${req.uid}`);
    } else {
      res.status(200).json(points);
      logger.info(`Fetched points for uid: ${req.uid}`);
    }
  } catch (error) {
    logger.error("Failed to fetch points from the database: " + error);
    next(error);
  }
};

export const getNearbyPoints = async (req: Request, res: Response, next: NextFunction) => {
  const { lat, lng } = req.query;

  logger.info(`Fetching nearby points for coordinates: ${lat}, ${lng}`);

  if (!lat || !lng) {
    res.status(400).json({ message: "Invalid query parameters. 'lat' and 'lng' are required." });
    logger.warn("Invalid query parameters for getNearbyPoints");
    return;
  }

  try {
    const points = await db.any(`
    SELECT id, name, description, rating, noise_level, busy_level, wifi, amenities, address, ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng, firebase_uid, image_url
    FROM points
    WHERE ST_DWithin(location, ST_GeogFromText('POINT(${lng} ${lat})'), 16093);
`);

    if (points.length === 0) {
      res.status(404).json({ message: "No nearby points found" });
      logger.info("No nearby points found");
    } else {
      // Sort points by distance from the user
      points.sort((a, b) => {
        const aDistance = Math.sqrt(Math.pow(a.lat - parseFloat(lat as string), 2) + Math.pow(a.lng - parseFloat(lng as string), 2));
        const bDistance = Math.sqrt(Math.pow(b.lat - parseFloat(lat as string), 2) + Math.pow(b.lng - parseFloat(lng as string), 2));
        return aDistance - bDistance;
      });
      res.status(200).json(points);
      logger.info("Fetched nearby points");
    }
  } catch (error) {
    logger.error("Failed to fetch nearby points from the database: " + error);
    next(error);
  }
};

export const getPointById = async (req: Request, res: Response, next: NextFunction) => {
  logger.info(`Fetching point with ID: ${req.params.pointId}`);
  try {
    const point = await db.oneOrNone("SELECT * FROM points WHERE id = $1", [req.params.pointId]);
    if (point) {
      res.status(200).json(point);
      logger.info(`Fetched point with ID: ${req.params.pointId}`);
    } else {
      res.status(404).json({ message: `Point with ID: ${req.params.pointId} not found` });
      logger.info(`Point with ID: ${req.params.pointId} not found`);
    }
  } catch (error) {
    logger.error("Failed to fetch point from the database: " + error);
    next(error);
  }
};

export const savePoint = async (req: Request, res: Response, next: NextFunction) => {
  // TODO: Validate user ID and point ID
  const userId = parseInt(req.body.userId);
  const pointId = parseInt(req.body.pointId);

  logger.info(`User ID ${userId} saving point ID ${pointId}`);

  if (!userId || !pointId) {
    res.status(400).json({ message: "Missing or invalid user ID or point ID." });
    logger.warn("Invalid user ID or point ID");
    return;
  }

  try {
    const result = await db.one("INSERT INTO saved_points (user_id, point_id) VALUES ($1, $2) RETURNING id", [userId, pointId]);

    res.status(201).json({ message: "Point saved", savedPointId: result.id });
    logger.info(`User ID ${userId} saved point ID ${pointId}`);
  } catch (error) {
    logger.error("Failed to save point: " + (error as Error).message);
    next(error);
  }
};

export const unsavePoint = async (req: Request, res: Response, next: NextFunction) => {
  const userId = parseInt(req.body.userId);
  const pointId = parseInt(req.body.pointId);

  logger.info(`User ID ${userId} unsaving point ID ${pointId}`);

  if (!userId || !pointId) {
    res.status(400).json({ message: "Missing or invalid user ID or point ID." });
    logger.warn("Invalid user ID or point ID");
    return;
  }

  try {
    const result = await db.result("DELETE FROM saved_points WHERE user_id = $1 AND point_id = $2", [userId, pointId]);

    if (result.rowCount > 0) {
      res.status(200).json({ message: "Point unsaved" });
      logger.info(`User ID ${userId} unsaved point ID ${pointId}`);
    } else {
      res.status(404).json({ message: "Saved point not found" });
      logger.info("Saved point not found for user ID: " + userId);
    }
  } catch (error) {
    logger.error("Failed to unsave point: " + (error as Error).message);
    next(error);
  }
};

export const getSavedPointsByUserId = async (req: Request, res: Response, next: NextFunction) => {
  logger.info(`Fetching saved points for user ID: ${req.params.userId}`);
  try {
    const points = await db.any("SELECT * FROM saved_points WHERE user_id = $1", [req.params.userId]);
    if (points.length === 0) {
      res.status(404).json({ message: `No saved points found for user ID: ${req.params.userId}` });
      logger.info(`No saved points found for user ID: ${req.params.userId}`);
    } else {
      res.status(200).json(points);
      logger.info(`Fetched saved points for user ID: ${req.params.userId}`);
    }
  } catch (error) {
    logger.error("Failed to fetch saved points from the database: " + error);
    next(error);
  }
};

export const createPoint = async (req: Request, res: Response, next: NextFunction) => {
  logger.info("Creating point");
  const imageFile = req.file;

  const name = req.body.name;
  const description = req.body.description || "";
  const address = req.body.address || "";
  const rating = parseInt(req.body.rating);
  const noise_level = parseInt(req.body.noise_level);
  const busy_level = parseInt(req.body.busy_level);
  const wifi = req.body.wifi;
  var amenities = req.body.amenities || [];
  const lat = parseFloat(req.body.lat);
  const lng = parseFloat(req.body.lng);

  if (amenities) {
    amenities = req.body.amenities.split(",");
  } else {
    amenities = ""; // or any default value
  }

  logger.info(`Creating point with name: ${name} at coordinates: ${lat}, ${lng}`);

  if (!name || !rating || !noise_level || !busy_level || !wifi || !lat || !lng) {
    res.status(400).json({ message: "Missing or invalid request data." });
    logger.error("Invalid data for creating a point");
    return;
  }

  try {
    let imageUrl = null;

    if (imageFile) {
      imageUrl = await uploadImageToBlobStorage(imageFile);
    }

    const result = await db.one(
      `INSERT INTO points (name, description, rating, noise_level, busy_level, wifi, amenities, address, location, image_url, firebase_uid)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ST_GeogFromText('POINT(${lng} ${lat})'), $9, $10)
       RETURNING id`,
      [name, description, rating, noise_level, busy_level, wifi, amenities, address, imageUrl, req.uid]
    );

    res.status(200).json({ message: "Point created", pointId: result.id });
    logger.info("Point created with ID: " + result.id);
  } catch (error) {
    logger.error("Failed to create point: " + error);
    next(error);
  }
};

export const updatePoint = async (req: Request, res: Response, next: NextFunction) => {
  const id: number = parseInt(req.params.id);

  const name = req.body.name;
  const description = req.body.description;
  const address = req.body.address;
  const rating = parseInt(req.body.rating);
  const noise_level = parseInt(req.body.noise_level);
  const busy_level = parseInt(req.body.busy_level);
  const wifi = req.body.wifi;
  const amenities = req.body.amenities.split(",");
  const lat = parseFloat(req.body.lat);
  const lng = parseFloat(req.body.lng);

  const imageFile = req.file;

  logger.info(`Updating point with ID: ${id}`);

  if (!id || !name || !description || !address || !rating || !noise_level || !busy_level || !wifi || !amenities || !lat || !lng) {
    res.status(400).json({ message: "Missing or invalid request data." });
    logger.warn("Invalid data for updating a point");
    return;
  }

  try {
    let imageUrl = null;

    if (imageFile) {
      imageUrl = await uploadImageToBlobStorage(imageFile);
    }

    const result = await db.result(
      `UPDATE points SET
       name = $1,
       description = $2,
       rating = $3,
       noise_level = $4,
       busy_level = $5,
       wifi = $6,
       amenities = $7,
       address = $8,
       location = ST_GeogFromText('POINT(${lng} ${lat})'),
       image_url = COALESCE($9, image_url)
       WHERE id = $10`,
      [name, description, rating, noise_level, busy_level, wifi, amenities, address, imageUrl, id]
    );

    if (result.rowCount > 0) {
      res.status(200).json({ message: "Point updated" });
      logger.info("Point updated with ID: " + id);
    } else {
      res.status(404).json({ message: "Point not found" });
      logger.info("Point not found with ID: " + id);
    }
  } catch (error) {
    logger.error("Failed to update point: " + error);
    next(error);
  }
};

export const deletePoint = async (req: Request, res: Response, next: NextFunction) => {
  const id: number = parseInt(req.params.pointId);

  logger.info(`Deleting point with ID: ${id}`);

  if (!id) {
    res.status(400).json({ message: "Missing or invalid request data." });
    logger.warn("Invalid data for deleting a point");
    return;
  }

  try {
    const result = await db.result("DELETE FROM points WHERE id = $1", [id]);

    if (result.rowCount > 0) {
      res.status(200).json({ message: "Point deleted" });
      logger.info("Point deleted with ID: " + id);
    } else {
      res.status(404).json({ message: "Point not found" });
      logger.info("Point not found with ID: " + id);
    }
  } catch (error) {
    logger.error("Failed to delete point: " + error);
    next(error);
  }
};
