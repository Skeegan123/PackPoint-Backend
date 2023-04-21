import express from "express";
import * as userController from "../controllers/userController";

const router = express.Router();

// Routes for user operations
router.get("/users", userController.getAllUsers);
router.get("/users/:userId", userController.getUserById);
router.post("/users", userController.createUser);
router.put("/users/:userId", userController.updateUser);
router.delete("/users/:userId", userController.deleteUser);

export default router;
