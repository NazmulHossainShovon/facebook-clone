import { Request, Response } from "express";
import { TeamModel } from "../../models/teamModel";
import writeThrough from "../../utils/writeThrough";

export const submitEmployeeLeave = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { employeeId, startDate, endDate } = req.body;
    const userId = (req as any).user?._id; // Extract userId from authenticated user

    // Validate input
    if (!employeeId || !startDate || !endDate) {
      return res
        .status(400)
        .json({
          msg: "Missing required fields: employeeId, startDate, endDate",
        });
    }

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "Unauthorized: User not authenticated" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (start > end) {
      return res
        .status(400)
        .json({ msg: "Start date must be before end date" });
    }

    // Fetch team belonging to the user to take a previous snapshot for rollback
    const team = await TeamModel.findOne({ teamId, userId });
    if (!team) {
      return res.status(404).json({ msg: "Team not found or not authorized" });
    }

    const previousMembers = JSON.parse(JSON.stringify(team.members || []));

    try {
      await writeThrough(
        async () => {
          // Re-fetch inside DB write to ensure fresh document
          const t = await TeamModel.findOne({ teamId, userId });
          if (!t) throw new Error("Team not found during write");

          const targetEmployee = t.members.find(
            (member: any) => member.employeeId === employeeId,
          );
          if (!targetEmployee) {
            const err: any = new Error("Employee not found in team");
            err.code = 404;
            throw err;
          }

          // Add the leave dates to the employee's leaveDates array
          const currentDate = new Date(start);
          while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD format

            const dateExists = targetEmployee.leaveDates.some(
              (leaveDate: Date) =>
                new Date(leaveDate).toISOString().split("T")[0] === dateStr,
            );

            if (!dateExists) {
              targetEmployee.leaveDates.push(new Date(currentDate));
            }

            currentDate.setDate(currentDate.getDate() + 1);
          }

          return await t.save();
        },
        [
          {
            key: `timeoff:team:${userId}:${teamId}`,
            payload: async (saved: any) => saved,
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
              console.error("Rollback failed for submitEmployeeLeave:", rbErr);
            }
          },
        },
      );

      res.json({ msg: "Leave dates added successfully" });
    } catch (err: any) {
      if (err && err.code === 404)
        return res.status(404).json({ msg: err.message });
      console.error("Error in write-through submitEmployeeLeave:", err);
      return res.status(500).json({ msg: "Server error" });
    }
  } catch (error) {
    console.error("Error submitting employee leave:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export interface EmployeeStatus {
  employeeId: string;
  name: string;
  role: string;
  isAvailable: boolean;
}

export interface CoverageDayDetail {
  date: Date;
  availableCount: number;
  isGap: boolean;
  totalMembers: number;
  employees: EmployeeStatus[];
}

export const getTeamCoverage = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = (req as any).user?._id; // Extract userId from authenticated user

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "Unauthorized: User not authenticated" });
    }

    // Fetch team belonging to the user
    const team = await TeamModel.findOne({ teamId, userId });
    if (!team) {
      return res.status(404).json({ msg: "Team not found or not authorized" });
    }

    // Calculate coverage for next 10 days starting from tomorrow
    const coverage: CoverageDayDetail[] = [];
    const today = new Date();
    today.setDate(today.getDate() + 1); // Start from tomorrow

    for (let i = 0; i < 10; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const dateStr = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD format

      // Calculate employee availability for this date
      const employees: EmployeeStatus[] = team.members.map((member: any) => {
        // Check if the member has a leave date that matches the current date
        const isOnLeave = member.leaveDates.some(
          (leaveDate: Date) =>
            new Date(leaveDate).toISOString().split("T")[0] === dateStr,
        );

        return {
          employeeId: member.employeeId,
          name: member.name,
          role: member.role,
          isAvailable: !isOnLeave,
        };
      });

      const availableCount = employees.filter((emp) => emp.isAvailable).length;
      const totalMembers = team.members.length;
      const isGap = availableCount < totalMembers * 0.5; // Less than 50% availability

      coverage.push({
        date: currentDate,
        availableCount,
        isGap,
        totalMembers,
        employees,
      });
    }

    res.json({ coverage });
  } catch (error) {
    console.error("Error getting team coverage:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
