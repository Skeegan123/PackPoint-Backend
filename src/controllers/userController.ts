import { NextFunction, Request, Response } from "express";
import db from "../config/db";
import logger from "../utils/logger";
import { User } from "../models/user";
import admin from "../utils/firebaseAdmin";

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  logger.info("Fetching all users");
  try {
    const users = await db.any("SELECT * FROM users");
    if (users.length === 0) {
      res.status(404).json({ message: "No users found" });
      logger.info("No users found");
    } else {
      res.status(200).json(users);
      logger.info("Fetched all users");
    }
  } catch (error) {
    logger.error("Failed to fetch users: " + error);
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  const userId = parseInt(req.params.userId);

  logger.info("Fetching user with ID: " + userId);

  if (!userId) {
    res.status(400).json({ message: "Missing or invalid user ID." });
    logger.warn("Invalid user ID");
    return;
  }

  try {
    const user = await db.one("SELECT * FROM users WHERE id = $1", [userId]);
    res.status(200).json(user);
    logger.info("Fetched user with ID: " + userId);
  } catch (error) {
    res.status(404).json({ message: "User not found" });
    logger.info("User not found with ID: " + userId);
    next(error);
  }
};

export const checkUserExists = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.uid;

  logger.info("Checking if user exists with uid: " + userId);

  if (!userId) {
    res.status(400).json({ message: "Missing or invalid uid." });
    logger.warn("Invalid uid");
    return;
  }

  try {
    const user = await db.oneOrNone("SELECT * FROM users WHERE firebase_uid = $1", [userId]);

    if (user) {
      res.status(200).json({ message: "User exists" });
      logger.info("User exists");
    } else {
      res.status(404).json({ message: "User not found" });
      logger.info("User not found");
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    logger.error("Error checking user existence:", error);
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { phone_number } = req.body;
  const firebase_uid = req.uid;

  logger.info("Creating user");

  if (!phone_number) {
    res.status(400).json({ message: "Missing or invalid phone number." });
    logger.warn("Invalid phone number");
    return;
  }

  try {
    const result = await db.one("INSERT INTO users (phone_number, firebase_uid) VALUES ($1, $2) RETURNING id", [
      phone_number,
      firebase_uid,
    ]);
    res.status(201).json({ message: "User created", userId: result.id });
    logger.info("User created with ID: " + result.id);
  } catch (error) {
    logger.error("Failed to create user: " + error);
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.userId);
  const { phone_number } = req.body;

  logger.info("Updating user with ID: " + id);

  if (!id || !phone_number) {
    res.status(400).json({ message: "Missing or invalid user ID or phone number." });
    logger.warn("Invalid user ID or phone number");
    return;
  }

  try {
    const result = await db.result("UPDATE users SET phone_number = $1 WHERE id = $2", [phone_number, id]);

    if (result.rowCount > 0) {
      res.status(200).json({ message: "User updated" });
      logger.info("User updated with ID: " + id);
    } else {
      res.status(404).json({ message: "User not found" });
      logger.info("User not found with ID: " + id);
    }
  } catch (error) {
    logger.error("Failed to update user: " + (error as Error).message);
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const uid = req.uid;

  logger.info("Deleting user with UID: " + uid);

  if (!uid) {
    res.status(400).json({ message: "Missing or invalid uid." });
    logger.warn("Invalid uid");
    return;
  }

  try {
    const result = await db.result("DELETE FROM users WHERE firebase_uid = $1", [uid]);

    admin.auth().deleteUser(uid);

    if (result.rowCount > 0) {
      res.status(200).json({ message: "User deleted" });
      logger.info("User deleted with UID: " + uid);
    } else {
      res.status(404).json({ message: "User not found" });
      logger.info("User not found with UID: " + uid);
    }
  } catch (error) {
    logger.error("Failed to delete user: " + (error as Error).message);
    next(error);
  }
};
