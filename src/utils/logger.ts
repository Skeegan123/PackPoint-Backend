import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf } = format;

const consoleFormat = format.printf(({ timestamp, level, message }) => {
  const colorizeLevel = format.colorize().colorize(level, level.toUpperCase());
  return `[${timestamp}] ${colorizeLevel}: ${message}`;
});

const fileFormat = format.printf(({ timestamp, level, message }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

const logger = createLogger({
  level: "verbose",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" })),
  transports: [
    new transports.Console({
      format: consoleFormat,
      level: "verbose",
    }),
    new transports.File({ filename: "packpoint-error.log", level: "error", format: fileFormat }),
    new transports.File({ filename: "packpoint-warn.log", level: "warn", format: fileFormat }),
    new transports.File({ filename: "packpoint-info.log", level: "info", format: fileFormat }),
  ],
});

export default logger;
