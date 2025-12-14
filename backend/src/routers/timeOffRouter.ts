import { Router } from 'express';
import { TeamModel } from '../models/teamModel';
import { isAuth } from '../utils';

const timeOffRouter = Router();

// POST endpoint to create a new team
timeOffRouter.post('/teams', isAuth, async (req, res) => {
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
});

// GET endpoint to fetch all teams (without full member data to reduce payload)
timeOffRouter.get('/teams', isAuth, async (req, res) => {
  try {
    const teams = await TeamModel.find({}, { teamId: 1 }); // Only return teamId field
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET endpoint to fetch team data
timeOffRouter.get('/teams/:teamId', isAuth, async (req, res) => {
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
});

// POST endpoint to add a member to a team
timeOffRouter.post('/teams/:teamId/members', isAuth, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { employeeId, name, role, leaveDates } = req.body;

    // Validate input
    if (!employeeId || !name || !role) {
      return res.status(400).json({
        msg: 'Employee ID, name, and role are required'
      });
    }

    // Fetch the team
    const team = await TeamModel.findOne({ teamId });
    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    // Check if member with this employeeId already exists in the team
    const existingMember = team.members.find(member => member.employeeId === employeeId);
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
});

// POST endpoint to simulate leave impact
timeOffRouter.post('/teams/:teamId/simulate-leave', isAuth, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { employeeId, startDate, endDate } = req.body;

    // Validate input
    if (!employeeId || !startDate || !endDate) {
      return res.status(400).json({ msg: 'Missing required fields: employeeId, startDate, endDate' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (start > end) {
      return res.status(400).json({ msg: 'Start date must be before end date' });
    }

    // Fetch team
    const team = await TeamModel.findOne({ teamId });
    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    // Find the target employee
    const targetEmployee = team.members.find(member => member.employeeId === employeeId);
    if (!targetEmployee) {
      return res.status(404).json({ msg: 'Employee not found in team' });
    }

    // Add the leave dates to the employee's leaveDates array
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format

      // Check if the date is already in the leaveDates array
      const dateExists = targetEmployee.leaveDates.some(leaveDate =>
        new Date(leaveDate).toISOString().split('T')[0] === dateStr
      );

      if (!dateExists) {
        // Add the date to the leaveDates array if it's not already there
        targetEmployee.leaveDates.push(new Date(currentDate));
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate coverage gaps based on leaveDates
    // Get all unique dates from the team's leave dates (next 30 days from today)
    const allDatesSet = new Set<string>();
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      allDatesSet.add(date.toISOString().split('T')[0]);
    }

    // Add any dates that might exist in employee leave dates
    team.members.forEach(member => {
      member.leaveDates.forEach(leaveDate => {
        allDatesSet.add(new Date(leaveDate).toISOString().split('T')[0]);
      });
    });

    const allDates = Array.from(allDatesSet).sort();

    const gaps = [];
    for (const dateStr of allDates) {
      const date = new Date(dateStr);

      // Count available team members for this date
      let availableCount = 0;
      team.members.forEach(member => {
        // Check if the member has a leave date that matches the current date
        const isOnLeave = member.leaveDates.some(leaveDate =>
          new Date(leaveDate).toISOString().split('T')[0] === dateStr
        );

        // Employee is available if they are not on leave on this date
        if (!isOnLeave) {
          availableCount++;
        }
      });

      const totalMembers = team.members.length;
      const isGap = availableCount < (totalMembers * 0.5); // Less than 50% availability

      gaps.push({
        date: date,
        availableCount,
        isGap,
        totalMembers
      });
    }

    // Save the updated team
    await team.save();

    res.json({ team, gaps });
  } catch (error) {
    console.error('Error simulating leave:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default timeOffRouter;