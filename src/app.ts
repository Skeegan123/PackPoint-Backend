import express, { Application, Request, Response, NextFunction } from "express";
import pointRoutes from "./routes/pointRoutes";
import userRoutes from "./routes/userRoutes";
import errorHandler from "./middlewares/errorHandler";

const app: Application = express();

app.use(express.json());

app.use("/api/points", pointRoutes);
app.use("/api/users", userRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Resource not found" });
});

app.use(errorHandler);

export default app;
