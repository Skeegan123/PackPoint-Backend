import { NextFunction, Request, Response } from "express";
import db from "../config/db";
import logger from "../utils/logger";

// Example controller functions
export const getAllPoints = async (req: Request, res: Response, next: NextFunction) => {
  // Fetch all points from the database and send as a response
  try {
    const points = await db.any("SELECT * FROM points");
    res.status(200).json(points);
    logger.info("Fetched all points");
  } catch (error) {
    // Log the error
    logger.error("Failed to fetch points from the database: " + error);
    // Pass the error to the errorHandler middleware
    next(error);
  }
};

export const getPointsByUserId = async (req: Request, res: Response, next: NextFunction) => {
  // Fetch all points by user ID from the database and send as a response
  try {
    const points = await db.any("SELECT * FROM points WHERE user_id = $1", [req.params.userId]);
    res.status(200).json(points);
    logger.info(`Fetched points for user ID: ${req.params.userId}`);
  } catch (error) {
    // Log the error
    logger.error("Failed to fetch points from the database: " + error);
    // Pass the error to the errorHandler middleware
    next(error);
  }
};

export const getSavedPointsByUserId = async (req: Request, res: Response, next: NextFunction) => {
  // Fetch all saved points by user ID from the database and send as a response
  try {
    const points = await db.any("SELECT * FROM saved_points WHERE user_id = $1", [req.params.userId]);
    res.status(200).json(points);
    logger.info(`Fetched saved points for user ID: ${req.params.userId}`);
  } catch (error) {
    // Log the error
    logger.error("Failed to fetch saved points from the database: " + error);
    // Pass the error to the errorHandler middleware
    next(error);
  }
};

export const getNearbyPoints = async (req: Request, res: Response, next: NextFunction) => {
  const { lat, lng } = req.query;

  // Fetch all nearby points from the database and send as a response
  try {
    const points = await db.any(`SELECT * FROM points WHERE ST_DWithin(location, ST_GeogFromText('POINT(${lng} ${lat})'), 16093);`);
    res.status(200).json(points);
    logger.info("Fetched nearby points");
  } catch (error) {
    // Log the error
    logger.error("Failed to fetch nearby points from the database: " + error);
    // Pass the error to the errorHandler middleware
    next(error);
  }
};

export const getPointById = async (req: Request, res: Response, next: NextFunction) => {
  // Fetch a point by ID from the database and send as a response
  try {
    const point = await db.one("SELECT * FROM points WHERE id = $1", [req.params.pointId]);
    res.status(200).json(point);
    logger.info(`Fetched point with ID: ${req.params.pointId}`);
  } catch (error) {
    // Log the error
    logger.error("Failed to fetch point from the database: " + error);
    // Pass the error to the errorHandler middleware
    next(error);
  }
};

export const createPoint = async (req: Request, res: Response, next: NextFunction) => {
  const { name, description, rating, noise_level, busy_level, wifi, amenities, address, lat, lng } = req.body;

  try {
    const result = await db.one(
      `INSERT INTO points (name, description, rating, noise_level, busy_level, wifi, amenities, address, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ST_GeogFromText('POINT(${lng} ${lat})'))
       RETURNING id`,
      [name, description, rating, noise_level, busy_level, wifi, amenities, address]
    );

    res.status(201).json({ message: "Point created", pointId: result.id });
    logger.info("Point created with ID: " + result.id);
  } catch (error) {
    logger.error("Failed to create point: " + error);
    next(error);
  }
};

export const updatePoint = async (req: Request, res: Response, next: NextFunction) => {
  const id: number = parseInt(req.params.id);
  const { name, description, rating, noise_level, busy_level, wifi, amenities, address, lat, lng }: any = req.body;

  try {
    await db.none(
      `UPDATE points SET
       name = $1,
       description = $2,
       rating = $3,
       noise_level = $4,
       busy_level = $5,
       wifi = $6,
       amenities = $7,
       address = $8,
       location = ST_GeogFromText('POINT(${lng} ${lat})')
       WHERE id = $9`,
      [name, description, rating, noise_level, busy_level, wifi, amenities, address, id]
    );

    res.status(200).json({ message: "Point updated" });
    logger.info("Point updated with ID: " + id);
  } catch (error) {
    logger.error("Failed to update point: " + error);
    next(error);
  }
};

export const deletePoint = async (req: Request, res: Response, next: NextFunction) => {
  const id: number = parseInt(req.params.pointId);

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
