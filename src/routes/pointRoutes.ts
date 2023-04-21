import express from "express";
import * as placeController from "../controllers/pointController";

const router = express.Router();

// Routes for point operations
router.get("/points", placeController.getAllPoints);
router.get("/points/user/:userId", placeController.getPointsByUserId);
router.get("/points/saved/user/:userId", placeController.getSavedPointsByUserId);
router.get("/points/nearby", placeController.getNearbyPoints);
router.get("/points/:pointId", placeController.getPointById);
router.post("/points", placeController.createPoint);
router.put("/points/:pointId", placeController.updatePoint);
router.delete("/points/:pointId", placeController.deletePoint);

export default router;
