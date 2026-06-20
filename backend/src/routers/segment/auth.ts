import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { UserModel, User } from "../../models/userModel";
import { generateToken } from "../../utils";
import { ensureUniqueApiKey, toSegmentUserResponse } from "./helpers";

export const registerHandler = async (req: Request, res: Response) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!email || !password) {
    res.status(400).json({ message: "email and password are required" });
    return;
  }

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  const apiKey = await ensureUniqueApiKey();
  const name = email.split("@")[0] || `user_${Date.now()}`;
  const user = await UserModel.create({
    name,
    email,
    password: bcrypt.hashSync(password),
    apiKey,
    authProvider: "local",
    receivedFriendReqs: [],
    sentFriendReqs: [],
    friends: [],
  });

  res.status(201).json({
    token: generateToken(user as User),
    user: toSegmentUserResponse(user.toObject()),
  });
};

export const loginHandler = async (req: Request, res: Response) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!email || !password) {
    res.status(400).json({ message: "email and password are required" });
    return;
  }

  const user = await UserModel.findOne({ email });
  if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  if (!user.apiKey) {
    user.apiKey = await ensureUniqueApiKey();
    await user.save();
  }

  res.json({
    token: generateToken(user as User),
    user: toSegmentUserResponse(user.toObject()),
  });
};

export const meHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (!user.apiKey) {
    user.apiKey = await ensureUniqueApiKey();
    await user.save();
  }

  res.json({ user: toSegmentUserResponse(user.toObject()) });
};
