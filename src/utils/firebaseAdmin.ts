import * as admin from "firebase-admin";
import logger from "../utils/logger";

const https = require("https");
const fs = require("fs");
const path = require("path");

const blobUrl = "https://packpoint.blob.core.windows.net/app-info/packpoint-5fba2-firebase-adminsdk-svi4j-d958796224.json";

https.get(blobUrl, (res: { pipe: (arg0: any) => void }) => {
  const filePath = path.resolve(__dirname, "../../packpoint-5fba2-firebase-adminsdk-svi4j-d958796224.json");
  const fileStream = fs.createWriteStream(filePath);
  res.pipe(fileStream);
});

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
