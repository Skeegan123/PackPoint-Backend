import { NextFunction, Request, Response } from "express";
import db from "../config/db";
import logger from "../utils/logger";
import { User } from "../models/user";
import { log } from "console";

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
    // If user not found, return 404 else return 500
    // if (error.received === 1) {
    //   res.status(404).json({ message: "User not found" });
    //   logger.info("User not found with ID: " + userId);
    // } else {
    //   res.status(500).json({ message: "Failed to fetch user" });
    //   logger.error("Failed to fetch user: " + error);
    //   next(error);
    // }
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { phone_number } = req.body;

  logger.info("Creating user");

  if (!phone_number) {
    res.status(400).json({ message: "Missing or invalid phone number." });
    logger.warn("Invalid phone number");
    return;
  }

  try {
    const result = await db.one("INSERT INTO users (phone_number) VALUES ($1) RETURNING id", [phone_number]);
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
  const id = parseInt(req.params.userId);

  logger.info("Deleting user with ID: " + id);

  if (!id) {
    res.status(400).json({ message: "Missing or invalid user ID." });
    logger.warn("Invalid user ID");
    return;
  }

  try {
    const result = await db.result("DELETE FROM users WHERE id = $1", [id]);

    if (result.rowCount > 0) {
      res.status(200).json({ message: "User deleted" });
      logger.info("User deleted with ID: " + id);
    } else {
      res.status(404).json({ message: "User not found" });
      logger.info("User not found with ID: " + id);
    }
  } catch (error) {
    logger.error("Failed to delete user: " + (error as Error).message);
    next(error);
  }
};
