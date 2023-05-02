// import pgPromise from "pg-promise";
// import logger from "../utils/logger";
// import { exit } from "process";

// const pgp = pgPromise({});

// const connection = {
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT || "5432"),
//   database: process.env.DB_NAME,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// };

// logger.info("Connecting to database...");

// const db = pgp(connection);
// db.one("SELECT $1 AS value", [123])
//   .then((data) => {
//     // success;
//     logger.info("Connected to database");
//   })
//   .catch((error) => {
//     // error;
//     logger.error("Unable to connect to database:", error);
//     // logger.info("Exiting application");
//     // exit(1);
//   });

// export default db;

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

let failedAttempts = 0;

// Function to test the DB connection
async function testConnection() {
  try {
    await Promise.race([
      db.one("SELECT $1 AS value", [123]),
      new Promise(
        (_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000) // 30 seconds in milliseconds
      ),
    ]);
    failedAttempts = 0;
    logger.info("Connected to database");
  } catch (error) {
    logger.error("Unable to connect to database:", error);
    failedAttempts++;
  }
}

// Test the connection when the app starts
testConnection();

// Set an interval to test the connection every 5 minutes
const intervalId = setInterval(async () => {
  if (failedAttempts < 5) {
    try {
      await testConnection();
    } catch (error) {
      logger.error("Database connection lost. Exiting application:", error);
      clearInterval(intervalId);
      exit(1);
    }
  } else {
    logger.error("Database connection lost. Exiting application");
    clearInterval(intervalId);
    exit(1);
  }
}, 1 * 60 * 1000); // 5 minutes in milliseconds

export default db;
