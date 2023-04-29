import { Request, Response, NextFunction, RequestHandler } from "express";
import admin from "../utils/firebaseAdmin";

declare global {
  namespace Express {
    interface Request {
      uid?: string;
    }
  }
}

export const authMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).send("Unauthorized");
  }

  const token = authorizationHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(403).send("Forbidden");
  }
};
