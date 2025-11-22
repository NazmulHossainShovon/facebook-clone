import { Request, Response } from "express";
import { UserModel } from "../models/userModel";
import asyncHandler from "express-async-handler";

export const checkChartLimit = asyncHandler(
  async (req: Request, res: Response) => {
    // Get user ID from the authenticated user (assuming isAuth middleware is used)
    const userId = (req as any).user._id;

    // Find the user in the database
    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if user has remaining chart limit
    if (user.remainingChartsLimit && user.remainingChartsLimit !== 0) {
      res.status(200).json({
        canGenerate: true,
        remainingChartsLimit: user.remainingChartsLimit,
      });
    } else {
      res.status(200).json({
        canGenerate: false,
        remainingChartsLimit: 0,
        message:
          "Chart generation limit reached. Please upgrade your account to generate more charts.",
      });
    }
  }
);

export const useChartLimit = asyncHandler(
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

    // Only decrement if remainingChartsLimit is not -1 (unlimited)
    if (user.remainingChartsLimit !== -1) {
      // Decrement the chart limit
      const updatedResult = await UserModel.findByIdAndUpdate(
        userId,
        { $inc: { remainingChartsLimit: -1 } },
        { new: true } // Return the updated document
      );

      if (!updatedResult) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      updatedUser = updatedResult;
    }
    // If remainingChartsLimit is -1, we just return the current user data without modification

    res.status(200).json({
      success: true,
      remainingChartsLimit: updatedUser.remainingChartsLimit || 0,
    });
  }
);
