import express, { Application, Request, Response, NextFunction } from "express";
import pointRoutes from "./routes/pointRoutes";
import userRoutes from "./routes/userRoutes";
import errorHandler from "./middlewares/errorHandler";
import rateLimit from "express-rate-limit";

const app: Application = express();

app.use(express.json());

// Enable rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});

// Apply rate limiting middleware to all routes
app.use(limiter);

app.use("/api/points", pointRoutes);
app.use("/api/users", userRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Resource not found" });
});

app.use(errorHandler);

export default app;
