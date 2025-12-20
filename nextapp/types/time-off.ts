export interface TeamMember {
  employeeId: string;
  name: string;
  role: string;
  leaveDates: Date[];
}

// Interface for team data returned by /api/time-off/teams (only contains teamId)
export interface SimpleTeam {
  teamId: string;
}

// Full team interface for when all team data is needed
export interface Team {
  _id?: string;
  teamId: string;
  userId: string;
  members: TeamMember[];
}

export interface EmployeeStatus {
  employeeId: string;
  name: string;
  role: string;
  isAvailable: boolean;
}

export interface CoverageDay {
  date: Date | string;
  availableCount: number;
  isGap: boolean;
  totalMembers: number;
  employees: EmployeeStatus[];
}

export interface TeamCoverageResponse {
  coverage: CoverageDay[];
}