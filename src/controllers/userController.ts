import { NextFunction, Request, Response } from "express";
import db from "../config/db";
import logger from "../utils/logger";
import { User } from "../models/user";

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await db.any("SELECT * FROM users");
    res.json(users);
    logger.info("Fetched all users");
  } catch (error) {
    logger.error("Failed to fetch users: " + error);
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await db.one("SELECT * FROM users WHERE id = $1", [req.params.userId]);
    res.json(user);
    logger.info("Fetched user with ID: " + req.params.userId);
  } catch (error) {
    logger.error("Failed to fetch user: " + error);
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { phone_number } = req.body;

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

  try {
    await db.none("UPDATE users SET phone_number = $1 WHERE id = $2", [phone_number, id]);
    res.status(200).json({ message: "User updated" });
    logger.info("User updated with ID: " + id);
  } catch (error) {
    logger.error("Failed to update user: " + error);
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.userId);

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
    logger.error("Failed to delete user: " + error);
    next(error);
  }
};
