import { Request, Response } from "express";
import { TeamModel } from "../../models/teamModel";

export const createTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.body;
    const userId = (req as any).user?.id; // Extract userId from authenticated user

    // Validate input
    if (!teamId) {
      return res.status(400).json({ msg: "Team ID is required" });
    }

    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized: User not authenticated" });
    }

    // Check if team with this ID already exists
    const existingTeam = await TeamModel.findOne({ teamId });
    if (existingTeam) {
      return res.status(409).json({ msg: "Team with this ID already exists" });
    }

    // Create new team with empty members array
    const newTeamData = {
      teamId,
      userId,
      members: [],
    };

    const newTeam = new TeamModel(newTeamData);
    const savedTeam = await newTeam.save();

    res.status(201).json({
      msg: "Team created successfully",
      team: {
        _id: savedTeam._id,
        teamId: savedTeam.teamId,
        userId: savedTeam.userId,
      },
    });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getAllTeams = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id; // Extract userId from authenticated user

    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized: User not authenticated" });
    }

    const teams = await TeamModel.find({ userId }, { teamId: 1 }); // Return only teams belonging to the user
    res.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = (req as any).user?.id; // Extract userId from authenticated user

    // Validate input
    if (!teamId) {
      return res.status(400).json({ msg: "Team ID is required" });
    }

    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized: User not authenticated" });
    }

    // Find the team by teamId and userId (ensure the team belongs to the user)
    const team = await TeamModel.findOne({ teamId, userId });

    if (!team) {
      return res.status(404).json({ msg: "Team not found or not authorized" });
    }

    res.json(team);
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
