import { PostModel } from "../models/postModel";
import { UserModel } from "../models/userModel";
import { isAuth } from "../utils";
import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";

export const postRouter = express.Router();

postRouter.get(
  "/",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const posts = await PostModel.find({ authorName: req.query.userName });
    res.json(posts);
  })
);

postRouter.post(
  "/create",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await UserModel.findById(req.user._id);
    const post = await PostModel.create({
      post: req.body.post,
      authorName: user.name,
      authorImage: user.image,
      userId: user._id,
    });
    res.send({ message: "Post Created" });
  })
);

postRouter.delete(
  "/delete/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await PostModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Post Deleted" });
  })
);
