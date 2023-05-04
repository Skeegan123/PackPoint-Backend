import * as admin from "firebase-admin";
import logger from "../utils/logger";

const https = require("https");
const fs = require("fs");
const path = require("path");

import * as serviceAccount from "../../packpoint-5fba2-firebase-adminsdk-svi4j-d958796224.json";

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
  logger.info("Firebase admin initialized");
} catch (error) {
  logger.error("Firebase admin initialization failed", error);
}

export default admin;
