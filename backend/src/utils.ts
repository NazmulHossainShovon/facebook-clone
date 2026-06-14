import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User, UserModel } from "./models/userModel";
import { TeamModel } from "./models/teamModel";
import {
  FREE_TIER_TEAM_LIMIT,
  FREE_TIER_MEMBER_LIMIT,
} from "./constants/userConstants";

export const generateToken = (user: User) => {
  const token = jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "30d",
    }
  );
  return token;
};

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Bearer xxxxx
    const decode = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload & {
      _id: string;
      name: string;
      email: string;
      isAdmin: boolean;
      token: string;
    };
    req.user = decode;
    next();
  } else {
    res.status(401).json({ message: "No Token" });
  }
};

export const checkTimeOffTeamLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "Unauthorized: User not authenticated" });
    }

    // Get user to check their timeOffAppTier
    const user = await UserModel.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // If user has free tier (timeOffAppTier = 0), enforce team limit
    if (user.timeOffAppTier === 0) {
      // Count number of teams for this user
      const teamCount = await TeamModel.countDocuments({ userId });

      // Check if team count exceeds or equals FREE_TIER_TEAM_LIMIT
      if (teamCount >= FREE_TIER_TEAM_LIMIT) {
        return res.status(403).json({
          msg: `Free tier limit exceeded: Maximum ${FREE_TIER_TEAM_LIMIT} teams allowed. Upgrade to paid tier to create more teams.`,
        });
      }
    }

    next();
  } catch (error) {
    console.error("Error checking time-off team limit:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const checkTimeOffMemberLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const { teamId } = req.params;

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "Unauthorized: User not authenticated" });
    }

    if (!teamId) {
      return res.status(400).json({ msg: "Team ID is required" });
    }

    // Get user to check their timeOffAppTier
    const user = await UserModel.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // If user has free tier (timeOffAppTier = 0), enforce member limit
    if (user.timeOffAppTier === 0) {
      // Get the specific team to check member count
      const team = await TeamModel.findOne({ teamId, userId }).exec();

      if (!team) {
        return res
          .status(404)
          .json({ msg: "Team not found or not authorized" });
      }

      // Check if team has more than FREE_TIER_MEMBER_LIMIT members
      if (team.members && team.members.length >= FREE_TIER_MEMBER_LIMIT) {
        return res.status(403).json({
          msg: `Free tier limit exceeded: Maximum ${FREE_TIER_MEMBER_LIMIT} members per team allowed. Upgrade to paid tier to add more members.`,
        });
      }
    }

    next();
  } catch (error) {
    console.error("Error checking time-off member limit:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
