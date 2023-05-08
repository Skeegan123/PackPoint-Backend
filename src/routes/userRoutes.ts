import express from "express";
import * as userController from "../controllers/userController";
import { authMiddleware } from "../middlewares/authentification";

const router = express.Router();

// Routes for user operations
router.get("/", authMiddleware, userController.getAllUsers);
router.get("/exists", authMiddleware, userController.checkUserExists);
router.get("/:userId", authMiddleware, userController.getUserById);
router.post("/", authMiddleware, userController.createUser);
router.put("/:userId", authMiddleware, userController.updateUser);
router.delete("/", authMiddleware, userController.deleteUser);

export default router;
