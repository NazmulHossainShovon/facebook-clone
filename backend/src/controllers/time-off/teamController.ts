import { Request, Response } from "express";
import { TeamModel } from "../../models/teamModel";

export const createTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.body;

    // Validate input
    if (!teamId) {
      return res.status(400).json({ msg: "Team ID is required" });
    }

    // Check if team with this ID already exists
    const existingTeam = await TeamModel.findOne({ teamId });
    if (existingTeam) {
      return res.status(409).json({ msg: "Team with this ID already exists" });
    }

    // Create new team with empty members array
    const newTeamData = {
      teamId,
      members: [],
    };

    const newTeam = new TeamModel(newTeamData);
    const savedTeam = await newTeam.save();

    res.status(201).json({
      msg: "Team created successfully",
      team: {
        _id: savedTeam._id,
        teamId: savedTeam.teamId,
      },
    });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getAllTeams = async (req: Request, res: Response) => {
  try {
    const teams = await TeamModel.find({}, { teamId: 1 }); // Only return teamId field
    res.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;

    // Validate input
    if (!teamId) {
      return res.status(400).json({ msg: "Team ID is required" });
    }

    // Find the team by teamId
    const team = await TeamModel.findOne({ teamId });

    if (!team) {
      return res.status(404).json({ msg: "Team not found" });
    }

    res.json(team);
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
