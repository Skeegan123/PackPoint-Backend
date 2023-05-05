import * as admin from "firebase-admin";
import logger from "../utils/logger";
import { as } from "pg-promise";

var serviceAccountJson: string = process.env.SERVICE_ACCOUNT as string;

var jsonObj = JSON.parse(serviceAccountJson);

let serviceAccount = jsonObj;

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
  logger.info("Firebase admin initialized");
} catch (error) {
  logger.error("Firebase admin initialization failed", error);
}

export default admin;
