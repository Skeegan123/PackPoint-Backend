import express from "express";
import * as placeController from "../controllers/pointController";

const router = express.Router();

// Routes for point operations
router.get("/", placeController.getAllPoints);
router.get("/user/:userId", placeController.getPointsByUserId);
router.get("/saved/user/:userId", placeController.getSavedPointsByUserId);
router.get("/nearby", placeController.getNearbyPoints);
router.get("/:pointId", placeController.getPointById);
router.post("/", placeController.createPoint);
router.put("/:pointId", placeController.updatePoint);
router.delete("/:pointId", placeController.deletePoint);

export default router;
