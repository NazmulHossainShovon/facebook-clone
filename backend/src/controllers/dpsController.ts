import { Request, Response } from "express";
import { UserModel } from "../models/userModel";
import asyncHandler from "express-async-handler";

export const checkDpsLimit = asyncHandler(
  async (req: Request, res: Response) => {
    // Get user ID from the authenticated user (assuming isAuth middleware is used)
    const userId = (req as any).user._id;

    // Find the user in the database
    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if user has remaining DPS calculation limit
    if (user.remainingDpsCalcLimit && user.remainingDpsCalcLimit !== 0) {
      res.status(200).json({
        canCalculate: true,
        remainingDpsCalcLimit: user.remainingDpsCalcLimit,
      });
    } else {
      res.status(200).json({
        canCalculate: false,
        remainingDpsCalcLimit: 0,
        message:
          "DPS calculation limit reached. Please upgrade your account to perform more calculations.",
      });
    }
  }
);

export const useDpsLimit = asyncHandler(
  async (req: Request, res: Response) => {
    // Get user ID from the authenticated user (assuming isAuth middleware is used)
    const userId = (req as any).user._id;

    // Find the user in the database to check current limit
    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    let updatedUser = user;

    // Only decrement if remainingDpsCalcLimit is not -1 (unlimited)
    if (user.remainingDpsCalcLimit !== -1) {
      // Decrement the DPS calculation limit
      const updatedResult = await UserModel.findByIdAndUpdate(
        userId,
        { $inc: { remainingDpsCalcLimit: -1 } },
        { new: true } // Return the updated document
      );

      if (!updatedResult) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      updatedUser = updatedResult;
    }
    // If remainingDpsCalcLimit is -1, we just return the current user data without modification

    res.status(200).json({
      success: true,
      remainingDpsCalcLimit: updatedUser.remainingDpsCalcLimit || 0,
    });
  }
);