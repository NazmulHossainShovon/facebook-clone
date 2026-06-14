import express, { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../utils/redis";
import { isAuth } from "../utils";
import { processS3Url } from "../controllers/dubController";

// Rate limiter: 1 request per 60 seconds per user using local Redis
const s3Limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  keyGenerator: (req: Request) => (req.user as { _id: string })._id,
  skip: (req: Request) => !(req.user as { _id: string })?._id,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
  }),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res
      .status(429)
      .json({ message: "Too many requests, please try again later." });
  },
});

export const dubRouter = express.Router();

dubRouter.post("/s3", isAuth, s3Limiter, processS3Url);

// Health check endpoint
dubRouter.get("/", (req: Request, res: Response) => {
  res.json({ message: "Dub API is running" });
});
