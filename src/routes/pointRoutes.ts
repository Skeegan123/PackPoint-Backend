import express from "express";
import * as placeController from "../controllers/pointController";
import multer from "multer";
import { authMiddleware } from "../middlewares/authentification";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Routes for point operations
router.get("/", authMiddleware, placeController.getAllPoints);
router.get("/user", authMiddleware, placeController.getPointsByUserId);
router.get("/saved/user/:userId", authMiddleware, placeController.getSavedPointsByUserId);
router.get("/nearby", authMiddleware, placeController.getNearbyPoints);
router.get("/:pointId", authMiddleware, placeController.getPointById);
router.post("/save-point", authMiddleware, placeController.savePoint);
router.delete("/unsave-point", authMiddleware, placeController.unsavePoint);
router.get("/:userId/saved-points", authMiddleware, placeController.getSavedPointsByUserId);
router.post("/", upload.single("image"), authMiddleware, placeController.createPoint);
router.put("/:id", upload.single("image"), authMiddleware, placeController.updatePoint);
router.delete("/:pointId", authMiddleware, placeController.deletePoint);

export default router;
