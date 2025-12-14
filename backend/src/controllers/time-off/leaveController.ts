import { Request, Response } from 'express';
import { TeamModel } from '../../models/teamModel';

export const simulateLeaveImpact = async (req: Request, res: Response) => {
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
    team.members.forEach((member: any) => {
      member.leaveDates.forEach((leaveDate: Date) => {
        allDatesSet.add(new Date(leaveDate).toISOString().split('T')[0]);
      });
    });

    const allDates = Array.from(allDatesSet).sort();

    const gaps = [];
    for (const dateStr of allDates) {
      const date = new Date(dateStr);

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
};