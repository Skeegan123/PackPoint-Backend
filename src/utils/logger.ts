import { createLogger, format, transports } from "winston";

const { combine, timestamp, colorize, printf } = format;

const consoleFormat = printf(({ timestamp, level, message }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

const logger = createLogger({
  level: "verbose",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" })),
  transports: [
    new transports.Console({
      format: combine(colorize(), consoleFormat),
    }),
    new transports.File({ filename: "packpoint-error.log", level: "error" }),
    new transports.File({ filename: "packpoint-warn.log", level: "warn" }),
    new transports.File({ filename: "packpoint-info.log", level: "info" }),
  ],
});

export default logger;
