import { Request, Response } from 'express';
import { TeamModel } from '../../models/teamModel';

export const createTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.body;

    // Validate input
    if (!teamId) {
      return res.status(400).json({ msg: 'Team ID is required' });
    }

    // Check if team with this ID already exists
    const existingTeam = await TeamModel.findOne({ teamId });
    if (existingTeam) {
      return res.status(409).json({ msg: 'Team with this ID already exists' });
    }

    // Create new team with empty members array
    const newTeamData = {
      teamId,
      members: []
    };

    const newTeam = new TeamModel(newTeamData);
    const savedTeam = await newTeam.save();

    res.status(201).json({
      msg: 'Team created successfully',
      team: {
        _id: savedTeam._id,
        teamId: savedTeam.teamId
      }
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getAllTeams = async (req: Request, res: Response) => {
  try {
    const teams = await TeamModel.find({}, { teamId: 1 }); // Only return teamId field
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const team = await TeamModel.findOne({ teamId });

    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    // Transform the team data to maintain compatibility with the Visualization component
    // The Visualization component expects the old availability format
    const teamObj = JSON.parse(JSON.stringify(team));

    const transformedTeam = {
      ...teamObj,
      members: teamObj.members.map((member: any) => {
        // Generate availability data based on leaveDates
        // For a period of 30 days from today, mark as unavailable if the date is in leaveDates
        const availability = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(today.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];

          // Check if this date is in the member's leaveDates
          const isOnLeave = member.leaveDates.some((leaveDate: Date) =>
            new Date(leaveDate).toISOString().split('T')[0] === dateStr
          );

          availability.push({
            date: new Date(date),
            available: !isOnLeave // Available if not on leave
          });
        }

        return {
          ...member,
          availability: availability
        };
      })
    };

    res.json(transformedTeam);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};