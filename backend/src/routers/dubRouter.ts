import express, { Request, Response } from "express";
import { isAuth } from "../utils";
import { processYoutubeUrl } from "../controllers/dubController";

export const dubRouter = express.Router();

dubRouter.post(
  "/",
  // isAuth,
  processYoutubeUrl
);

// Health check endpoint
dubRouter.get("/", (req: Request, res: Response) => {
  res.json({ message: "Dub API is running" });
});
