import { PostModel } from "../models/postModel";
import { isAuth } from "../utils";
import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";

export const postRouter = express.Router();

postRouter.post(
  "/create",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const post = await PostModel.create({
      post: req.body.post,
      user: req.user._id,
    });
    res.send({ message: "Post Created" });
  })
);
