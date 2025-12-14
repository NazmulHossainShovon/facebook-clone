import { Router } from 'express';
import { isAuth } from '../utils';
import { createTeam, getAllTeams, getTeam } from '../controllers/time-off/teamController';
import { addMemberToTeam } from '../controllers/time-off/memberController';
import { simulateLeaveImpact } from '../controllers/time-off/leaveController';

const timeOffRouter = Router();

// POST endpoint to create a new team
timeOffRouter.post('/teams', isAuth, createTeam);

// GET endpoint to fetch all teams (without full member data to reduce payload)
timeOffRouter.get('/teams', isAuth, getAllTeams);

// GET endpoint to fetch team data
timeOffRouter.get('/teams/:teamId', isAuth, getTeam);

// POST endpoint to add a member to a team
timeOffRouter.post('/teams/:teamId/members', isAuth, addMemberToTeam);

// POST endpoint to simulate leave impact
timeOffRouter.post('/teams/:teamId/simulate-leave', isAuth, simulateLeaveImpact);

export default timeOffRouter;