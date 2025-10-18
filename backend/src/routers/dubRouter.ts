import express, { Request, Response } from "express";
import { isAuth } from "../utils";
import { processS3Url } from "../controllers/dubController";

export const dubRouter = express.Router();

dubRouter.post("/s3", isAuth, processS3Url);

// Health check endpoint
dubRouter.get("/", (req: Request, res: Response) => {
  res.json({ message: "Dub API is running" });
});
