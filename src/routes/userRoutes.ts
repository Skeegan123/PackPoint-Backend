import express from "express";
import * as userController from "../controllers/userController";

const router = express.Router();

// Routes for user operations
router.get("/", userController.getAllUsers);
router.get("/:userId", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:userId", userController.updateUser);
router.delete("/:userId", userController.deleteUser);

export default router;
