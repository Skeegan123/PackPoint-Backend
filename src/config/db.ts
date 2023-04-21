import pgPromise from "pg-promise";

const pgp = pgPromise({});

const connection = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "your_database",
  user: process.env.DB_USER || "your_user",
  password: process.env.DB_PASSWORD || "your_password",
};

const db = pgp(connection);

export default db;
