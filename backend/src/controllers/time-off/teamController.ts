import { Request, Response } from "express";
import { TeamModel } from "../../models/teamModel";
import { getJson, setJson } from "../../utils/redis";
import writeThrough from "../../utils/writeThrough";

export const createTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.body;
    const userId = (req as any).user?._id; // Extract userId from authenticated user

    // Validate input
    if (!teamId) {
      return res.status(400).json({ msg: "Team ID is required" });
    }

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "Unauthorized: User not authenticated" });
    }

    // Check if team with this ID already exists for this user
    const existingTeam = await TeamModel.findOne({ teamId, userId });
    if (existingTeam) {
      return res
        .status(409)
        .json({ msg: "Team with this ID already exists for your account" });
    }

    // Create new team with empty members array
    const newTeamData = {
      teamId,
      userId,
      members: [],
    };

    // Use write-through: save to DB, then update the teams list cache
    try {
      const savedTeam = await writeThrough(
        async () => {
          const newTeam = new TeamModel(newTeamData);
          return await newTeam.save();
        },
        [
          {
            key: `timeoff:teams:${userId}`,
            // payload builder fetches fresh list from DB
            payload: async () =>
              await TeamModel.find({ userId }, { teamId: 1 }),
            ttl: 300,
          },
        ],
        {
          rollback: async (saved: any) => {
            try {
              await TeamModel.deleteOne({ _id: saved._id });
            } catch (rbErr) {
              console.error("Rollback failed for createTeam:", rbErr);
            }
          },
        },
      );

      res.status(201).json({
        msg: "Team created successfully",
        team: {
          _id: savedTeam._id,
          teamId: savedTeam.teamId,
          userId: savedTeam.userId,
        },
      });
    } catch (err) {
      console.error("Error in write-through createTeam:", err);
      return res.status(500).json({ msg: "Server error" });
    }
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getAllTeams = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id; // Extract userId from authenticated user

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "Unauthorized: User not authenticated" });
    }

    const cacheKey = `timeoff:teams:${userId}`;
    try {
      const cached = await getJson(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    } catch (err) {
      console.error("Redis get error for getAllTeams:", err);
    }

    const teams = await TeamModel.find({ userId }, { teamId: 1 }); // Return only teams belonging to the user
    try {
      await setJson(cacheKey, teams, 300); // cache for 5 minutes
    } catch (err) {
      console.error("Redis set error for getAllTeams:", err);
    }
    res.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = (req as any).user?._id; // Extract userId from authenticated user

    // Validate input
    if (!teamId) {
      return res.status(400).json({ msg: "Team ID is required" });
    }

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "Unauthorized: User not authenticated" });
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
