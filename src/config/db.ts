import pgPromise from "pg-promise";
import logger from "../utils/logger";
import { exit } from "process";

const pgp = pgPromise({});

const connection = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
};

logger.info("Connecting to database...");

const db = pgp(connection);
db.one("SELECT $1 AS value", [123])
  .then((data) => {
    // success;
    logger.info("Connected to database");
  })
  .catch((error) => {
    // error;
    logger.error("Unable to connect to database:", error);
    // logger.info("Exiting application");
    // exit(1);
  });

export default db;
