// import dotenv from "dotenv";
import logger from "./utils/logger";
// import path from "path";

// dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

import app from "./app";

const PORT = process.env.PORT;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
