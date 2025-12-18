import { Request, Response } from 'express';
import { TeamModel } from '../../models/teamModel';

export const addMemberToTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { employeeId, name, role, leaveDates } = req.body;
    const userId = (req as any).user?.id; // Extract userId from authenticated user

    // Validate input
    if (!employeeId || !name || !role) {
      return res.status(400).json({
        msg: 'Employee ID, name, and role are required'
      });
    }

    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized: User not authenticated" });
    }

    // Fetch the team belonging to the user
    const team = await TeamModel.findOne({ teamId, userId });
    if (!team) {
      return res.status(404).json({ msg: 'Team not found or not authorized' });
    }

    // Check if member with this employeeId already exists in the team
    const existingMember = team.members.find((member: any) => member.employeeId === employeeId);
    if (existingMember) {
      return res.status(409).json({ msg: 'Member with this employee ID already exists in the team' });
    }

    // Create new member with empty leaveDates array if not provided
    const newMember = {
      employeeId,
      name,
      role,
      leaveDates: leaveDates || [] // Use provided leaveDates or start with empty array
    };

    // Add the new member to the team
    team.members.push(newMember);

    // Save the updated team
    const updatedTeam = await team.save();

    res.status(201).json({
      msg: 'Team member added successfully',
      member: newMember
    });
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};