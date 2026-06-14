import { Request, Response } from "express";
import { TeamModel } from "../../models/teamModel";
import writeThrough from "../../utils/writeThrough";

export const addMemberToTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { employeeId, name, role, leaveDates } = req.body;
    const userId = (req as any).user?._id; // Extract userId from authenticated user

    // Validate input
    if (!employeeId || !name || !role) {
      return res.status(400).json({
        msg: "Employee ID, name, and role are required",
      });
    }

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "Unauthorized: User not authenticated" });
    }

    // Fetch the team belonging to the user
    const team = await TeamModel.findOne({ teamId, userId });
    if (!team) {
      return res.status(404).json({ msg: "Team not found or not authorized" });
    }

    // Check if member with this employeeId already exists in the team
    const existingMember = team.members.find(
      (member: any) => member.employeeId === employeeId,
    );
    if (existingMember) {
      return res
        .status(409)
        .json({
          msg: "Member with this employee ID already exists in the team",
        });
    }

    // Create new member with empty leaveDates array if not provided
    const newMember = {
      employeeId,
      name,
      role,
      leaveDates: leaveDates || [], // Use provided leaveDates or start with empty array
    };

    // Snapshot previous members for rollback if needed
    const previousMembers = JSON.parse(JSON.stringify(team.members || []));

    try {
      const updatedTeam = await writeThrough(
        async () => {
          team.members.push(newMember);
          return await team.save();
        },
        [
          {
            key: `timeoff:team:${userId}:${teamId}`,
            payload: async (saved: any) => saved,
          },
          {
            key: `timeoff:teams:${userId}`,
            payload: async () =>
              await TeamModel.find({ userId }, { teamId: 1 }),
            ttl: 300,
          },
        ],
        {
          rollback: async () => {
            try {
              await TeamModel.updateOne(
                { _id: team._id },
                { members: previousMembers },
              );
            } catch (rbErr) {
              console.error("Rollback failed for addMemberToTeam:", rbErr);
            }
          },
        },
      );

      res
        .status(201)
        .json({ msg: "Team member added successfully", member: newMember });
    } catch (err) {
      console.error("Error in write-through addMemberToTeam:", err);
      return res.status(500).json({ msg: "Server error" });
    }
  } catch (error) {
    console.error("Error adding team member:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
