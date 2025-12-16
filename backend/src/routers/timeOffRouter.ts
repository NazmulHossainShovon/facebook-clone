import { Router } from "express";
import { isAuth } from "../utils";
import {
  createTeam,
  getAllTeams,
  getTeamById,
} from "../controllers/time-off/teamController";
import { addMemberToTeam } from "../controllers/time-off/memberController";
import { submitEmployeeLeave, getTeamCoverage } from "../controllers/time-off/leaveController";

const timeOffRouter = Router();

// POST endpoint to create a new team
timeOffRouter.post("/teams", isAuth, createTeam);

// GET endpoint to fetch all teams (without full member data to reduce payload)
timeOffRouter.get("/teams", isAuth, getAllTeams);

// GET endpoint to fetch a specific team by ID
timeOffRouter.get("/teams/:teamId", isAuth, getTeamById);

// POST endpoint to add a member to a team
timeOffRouter.post("/teams/:teamId/members", isAuth, addMemberToTeam);

// POST endpoint to submit employee leave
timeOffRouter.post(
  "/teams/:teamId/submit-leave",
  isAuth,
  submitEmployeeLeave
);

// GET endpoint to get team coverage
timeOffRouter.get(
  "/teams/:teamId/coverage",
  isAuth,
  getTeamCoverage
);

export default timeOffRouter;
