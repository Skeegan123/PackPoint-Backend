import logger from "./utils/logger";

import app from "./app";

const https = require("https");
const fs = require("fs");
const path = require("path");

function downloadFile(blobUrl: String, filePath: any) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filePath);
    https.get(blobUrl, (res: any) => {
      res.pipe(fileStream);
      fileStream.on("finish", resolve);
      fileStream.on("error", reject);
    });
  });
}

async function startServer() {
  await downloadFile(
    "https://packpoint.blob.core.windows.net/app-info/packpoint-5fba2-firebase-adminsdk-svi4j-d958796224.json",
    path.resolve(__dirname, "../../packpoint-5fba2-firebase-adminsdk-svi4j-d958796224.json")
  );

  const PORT = process.env.PORT;

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
