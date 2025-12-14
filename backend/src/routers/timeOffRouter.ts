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

// GET endpoint to fetch team data
timeOffRouter.get('/teams/:teamId', isAuth, async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await TeamModel.findOne({ teamId });

    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
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

    // Simulate leave by setting availability to false during the leave period
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
      const existingAvail = targetEmployee.availability.find(avail => 
        new Date(avail.date).toISOString().split('T')[0] === dateStr
      );

      if (existingAvail) {
        existingAvail.available = false;
      } else {
        // Add new availability entry if not existing
        targetEmployee.availability.push({
          date: new Date(currentDate),
          available: false
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate coverage gaps
    // Get all unique dates from the team's availability (next 30 days from today)
    const allDatesSet = new Set<string>();
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      allDatesSet.add(date.toISOString().split('T')[0]);
    }

    // Add any dates that might exist in employee availability but are not in the next 30 days
    team.members.forEach(member => {
      member.availability.forEach(avail => {
        allDatesSet.add(new Date(avail.date).toISOString().split('T')[0]);
      });
    });

    const allDates = Array.from(allDatesSet).sort();

    const gaps = [];
    for (const dateStr of allDates) {
      const date = new Date(dateStr);
      
      // Count available team members for this date
      let availableCount = 0;
      team.members.forEach(member => {
        const memberAvail = member.availability.find(avail => 
          new Date(avail.date).toISOString().split('T')[0] === dateStr
        );
        
        if (memberAvail && memberAvail.available) {
          availableCount++;
        } else if (!memberAvail && date >= today) {
          // If no availability record exists and it's a future date, assume available
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

    res.json({ team, gaps });
  } catch (error) {
    console.error('Error simulating leave:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default timeOffRouter;