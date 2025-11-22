import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { User, UserModel } from "../models/userModel";
import { generateToken, isAuth } from "../utils";
import { io, userSocketMap } from "..";
import { sendWelcomeEmail } from "../utils/awsSes";
import passport from "../config/passport";

export const userRouter = express.Router();
// POST /api/users/signin
userRouter.post(
  "/signin",
  asyncHandler(async (req: Request, res: Response) => {
    const user = await UserModel.findOne({
      email: req.body.email,
    }).lean<User>();
    if (user) {
      // Check if user uses Google auth
      if (user.authProvider === "google" && !user.password) {
        res.status(401).json({ message: "Please sign in with Google" });
        return;
      }

      // Check password for local auth users
      if (
        user.password &&
        bcrypt.compareSync(req.body.password, user.password)
      ) {
        const { password, ...userExceptPassword } = user;
        res.json({
          user: userExceptPassword,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).json({ message: "Invalid email or password" });
  })
);

userRouter.get(
  "/",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await UserModel.findOne({ name: req.query.userName });
    console.log(user);

    res.json(user);
  })
);

userRouter.get(
  "/friends",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await UserModel.findOne({ name: req.query.userName }).select(
      "friends"
    );
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Get full user objects for all friends
    const friends = await UserModel.find({
      name: { $in: user.friends },
    }).select("_id name profileImage");
    res.json(friends);
  })
);

userRouter.post(
  "/signup",
  asyncHandler(async (req: Request, res: Response) => {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: req.body.email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists with this email" });
      return;
    }

    const user = await UserModel.create({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
      profileImage: req.body.image,
      authProvider: "local",
      receivedFriendReqs: [],
      sentFriendReqs: [],
      friends: [],
    });
    const { password, ...userExceptPassword } = user.toObject();

    const emailSent = await sendWelcomeEmail(user.email, user.name);

    res.json({
      user: userExceptPassword,
      token: generateToken(user),
      emailSent,
    });
  })
);

userRouter.put(
  "/friendRequest",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    await UserModel.findOneAndUpdate(
      { name: req.body.receiver },
      { $push: { receivedFriendReqs: req.body.sender } }
    );
    const updatedUser = await UserModel.findOneAndUpdate(
      { name: req.body.sender },
      { $push: { sentFriendReqs: req.body.receiver } },
      { new: true }
    ).select("-password");

    const receiverSocketId = userSocketMap.get(req.body.receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friendRequest", { from: req.body.sender });
    }

    res.json(updatedUser);
  })
);

userRouter.put(
  "/cancelRequest",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const updatedReceiver = await UserModel.findOneAndUpdate(
      { name: req.body.receiver },
      { $pull: { receivedFriendReqs: req.body.sender } },
      { new: true }
    ).select("-password");
    const updatedSender = await UserModel.findOneAndUpdate(
      { name: req.body.sender },
      { $pull: { sentFriendReqs: req.body.receiver } },
      { new: true }
    ).select("-password");

    res.json({ receiver: updatedReceiver, sender: updatedSender });
  })
);

userRouter.put(
  "/acceptRequest",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    await UserModel.findOneAndUpdate(
      { name: req.body.receiver },
      { $push: { friends: req.body.sender } }
    );
    await UserModel.findOneAndUpdate(
      { name: req.body.sender },
      { $push: { friends: req.body.receiver } }
    );
    const updatedUser = await UserModel.findOneAndUpdate(
      { name: req.body.receiver },
      { $pull: { receivedFriendReqs: req.body.sender } },
      { new: true }
    ).select("-password");
    await UserModel.findOneAndUpdate(
      { name: req.body.sender },
      { $pull: { sentFriendReqs: req.body.receiver } }
    );

    res.json(updatedUser);
  })
);

userRouter.put(
  "/unfriend",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const updatedUser = await UserModel.findOneAndUpdate(
      { name: req.body.user1 },
      { $pull: { friends: req.body.user2 } },
      { new: true }
    ).select("-password");
    await UserModel.findOneAndUpdate(
      { name: req.body.user2 },
      { $pull: { friends: req.body.user1 } }
    );

    res.json({ message: "successfully unfriend", currentUser: updatedUser });
  })
);

// Google OAuth routes
userRouter.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

userRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    if (user) {
      const { password, ...userExceptPassword } = user.toObject
        ? user.toObject()
        : user;
      const token = generateToken(user);

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(
        `${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(
          JSON.stringify(userExceptPassword)
        )}`
      );
    } else {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(`${frontendUrl}/login?error=authentication_failed`);
    }
  })
);
