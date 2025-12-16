import { Request, Response } from 'express';
import { TeamModel } from '../../models/teamModel';

export const submitEmployeeLeave = async (req: Request, res: Response) => {
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
    const targetEmployee = team.members.find((member: any) => member.employeeId === employeeId);
    if (!targetEmployee) {
      return res.status(404).json({ msg: 'Employee not found in team' });
    }

    // Add the leave dates to the employee's leaveDates array
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format

      // Check if the date is already in the leaveDates array
      const dateExists = targetEmployee.leaveDates.some((leaveDate: Date) =>
        new Date(leaveDate).toISOString().split('T')[0] === dateStr
      );

      if (!dateExists) {
        // Add the date to the leaveDates array if it's not already there
        targetEmployee.leaveDates.push(new Date(currentDate));
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Save the updated team
    await team.save();

    res.json({ msg: 'Leave dates added successfully' });
  } catch (error) {
    console.error('Error submitting employee leave:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getTeamCoverage = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;

    // Fetch team
    const team = await TeamModel.findOne({ teamId });
    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    // Calculate coverage for next 10 days starting from tomorrow
    const coverage = [];
    const today = new Date();
    today.setDate(today.getDate() + 1); // Start from tomorrow

    for (let i = 0; i < 10; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Count available team members for this date
      let availableCount = 0;
      team.members.forEach((member: any) => {
        // Check if the member has a leave date that matches the current date
        const isOnLeave = member.leaveDates.some((leaveDate: Date) =>
          new Date(leaveDate).toISOString().split('T')[0] === dateStr
        );

        // Employee is available if they are not on leave on this date
        if (!isOnLeave) {
          availableCount++;
        }
      });

      const totalMembers = team.members.length;
      const isGap = availableCount < (totalMembers * 0.5); // Less than 50% availability

      coverage.push({
        date: currentDate,
        availableCount,
        isGap,
        totalMembers
      });
    }

    res.json({ coverage });
  } catch (error) {
    console.error('Error getting team coverage:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};