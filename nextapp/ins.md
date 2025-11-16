# Instructions for Qwen Code CLI Agent: Building Time-Off Impact Simulator MVP

## Overview for the Agent

You are tasked with building a Minimum Viable Product (MVP) for a "Time-Off Impact Simulator" webapp. This will be integrated as a new route (`/time-off-simulator`) in an existing Next.js (frontend), Express (backend), and MongoDB app. The app already has authentication flows set up (e.g., JWT-based auth with protected routes).

### MVP Scope

- **User Flow:** Authenticated users (e.g., managers) can submit a leave request (employee ID, start date, end date). The app fetches the team calendar from MongoDB, simulates the impact by marking the leave period as unavailable for that employee, and visualizes coverage gaps (e.g., days with fewer than 50% team availability) using a simple calendar table.
- **Assumptions:**
  - Team data in MongoDB: A `teams` collection with documents like `{ teamId: string, members: [{ employeeId: string, name: string, role: string, availability: [{ date: Date, available: boolean }] }] }`.
  - Auth: Use existing middleware to protect the new route/API.
  - Visualization: Simple HTML table calendar (no external libs for MVP; add later if needed).
  - No real-time updates; simulate on submit.
- **Tech Stack:** Stick to existing: Next.js for frontend (pages or app router? Assume app router for modernity), Express for API, Mongoose for MongoDB.
- **Output:** Modify/add files in the project root. Commit changes to a new branch `feature/time-off-simulator-mvp` after each major phase. Test locally after each phase.

Follow these instructions **exactly**, breaking them into small, sequential steps. Execute one step at a time, confirming success before proceeding. If an error occurs, debug and log it, then retry. Use `npm run dev` for Next.js testing and `nodemon server.js` (or equivalent) for Express.

---

## Phase 2: Backend - Database Schema and Models (15-20 mins)

Focus: Extend MongoDB schema for team calendar and leave requests. Use existing Mongoose setup.

1. In the `models/` directory (create if missing), create a new file `Team.js`.
2. In `Team.js`, import Mongoose: `const mongoose = require('mongoose');`.
3. Define a sub-schema for members: `const memberSchema = new mongoose.Schema({ employeeId: { type: String, required: true }, name: { type: String, required: true }, role: { type: String, required: true }, availability: [{ date: { type: Date, required: true }, available: { type: Boolean, default: true } }] });`.
4. Define the main Team schema: `const teamSchema = new mongoose.Schema({ teamId: { type: String, required: true, unique: true }, members: [memberSchema] });`.
5. Add timestamps: `teamSchema.options.timestamps = true;`.
6. Export the model: `module.exports = mongoose.model('Team', teamSchema);`.
7. Create a sample seed script in `scripts/seedTeams.js` (create `scripts/` if missing).
8. In `seedTeams.js`, import Team model and connect to DB (use existing DB URI from config).
9. Add sample data: `const sampleTeam = { teamId: 'team-1', members: [{ employeeId: 'emp-1', name: 'Alice', role: 'Developer', availability: [] }, { employeeId: 'emp-2', name: 'Bob', role: 'Designer', availability: [] }, { employeeId: 'emp-3', name: 'Charlie', role: 'Manager', availability: [] }] };` (availability will be populated later).
10. Populate availability for 30 days from today: Loop from current date to +30 days, set `available: true` for each. Use `new Date()` for dates.
11. Save: `await Team.create(sampleTeam);`. Run the script: `node scripts/seedTeams.js`. Confirm in MongoDB Compass or shell that data is inserted.
12. Restart Express server and test: In MongoDB shell, query `db.teams.findOne()` to verify.

---

## Phase 3: Backend - API Endpoints (20-25 mins)

Focus: Add Express routes for fetching team data and simulating leave impact. Protect with existing auth middleware (assume it's called `authMiddleware`).

1. In `routes/` (create if missing), create `timeOffRoutes.js`.
2. Import Express Router: `const express = require('express'); const router = express.Router();`.
3. Import Team model: `const Team = require('../models/Team');`.
4. Import auth middleware: `const auth = require('../middleware/auth');` (adjust path if different).
5. Add GET endpoint `/api/teams/:teamId`: `router.get('/teams/:teamId', auth, async (req, res) => { ... });`.
6. Inside: `const { teamId } = req.params; const team = await Team.findOne({ teamId }); if (!team) return res.status(404).json({ msg: 'Team not found' }); res.json(team);`.
7. Add POST endpoint `/api/teams/:teamId/simulate-leave`: `router.post('/teams/:teamId/simulate-leave', auth, async (req, res) => { ... });`.
8. Inside: Destructure `req.body`: `{ employeeId, startDate, endDate }`. Parse dates: `const start = new Date(startDate); const end = new Date(endDate);`.
9. Fetch team: Same as above.
10. Simulate: Loop through team.members, find the target employee, then for each date in start to end, set `available: false` in their availability (create entries if missing).
11. Compute gaps: For each unique date in the team's availability (next 30 days), count available members. Flag gap if count < (totalMembers \* 0.5).
12. Return: `{ team: modifiedTeam, gaps: [{ date: Date, availableCount: number, isGap: boolean }] }`.
13. Mount routes in main `server.js` or `app.js`: `app.use('/api', timeOffRoutes);` (adjust if routes/ is structured differently).
14. Restart Express, test with Postman: GET `/api/teams/team-1` (with auth token), then POST `/api/teams/team-1/simulate-leave` with body `{ "employeeId": "emp-1", "startDate": "2025-11-20", "endDate": "2025-11-25" }`. Verify response has gaps array.

---

## Phase 4: Frontend - New Route and Form (25-30 mins)

Focus: Add Next.js page for the simulator. Use app router (`app/` dir). Protect with existing auth (assume HOC or middleware).

1. In `app/time-off-simulator/page.tsx` (create dir/file), import React hooks: `useState, useEffect`.
2. Import fetch or axios (use native fetch for MVP).
3. Assume auth token from context/localStorage: `const token = localStorage.getItem('token');` (integrate with existing auth).
4. Set teamId constant: `const teamId = 'team-1';`.
5. Use state: `const [team, setTeam] = useState(null); const [leave, setLeave] = useState({ employeeId: '', startDate: '', endDate: '' }); const [simulation, setSimulation] = useState(null); const [loading, setLoading] = useState(false);`.
6. On mount: `useEffect(() => { fetchTeam(); }, []);`.
7. Define `fetchTeam`: `async () => { setLoading(true); const res = await fetch(`/api/teams/${teamId}`, { headers: { Authorization: `Bearer ${token}` } }); const data = await res.json(); setTeam(data); setLoading(false); }`.
8. Add form: `<form onSubmit={handleSubmit}> <select value={leave.employeeId} onChange={e => setLeave({...leave, employeeId: e.target.value})}> {team?.members.map(m => <option key={m.employeeId} value={m.employeeId}>{m.name} ({m.role})</option>)} </select> <input type="date" value={leave.startDate} onChange={...} /> <input type="date" value={leave.endDate} onChange={...} /> <button type="submit">Simulate</button> </form>`.
9. Define `handleSubmit`: `e.preventDefault(); setLoading(true); const res = await fetch(`/api/teams/${teamId}/simulate-leave`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(leave) }); const data = await res.json(); setSimulation(data); setLoading(false);`.
10. Add auth check: If no token, redirect to login: `if (!token) { window.location.href = '/login'; return <div>Redirecting...</div>; }`.
11. Wrap in layout if needed (use existing root layout).
12. Run `npm run dev`, visit `/time-off-simulator`. Ensure form loads team members, submit works (check console/network for API calls).

---

## Phase 5: Frontend - Visualization Component (20-25 mins)

Focus: Render a simple table calendar showing availability and gaps.

1. In the same `page.tsx`, add conditional render: `if (simulation) return <Visualization data={simulation} />;`.
2. Create a new component `components/Visualization.tsx` (create `components/` if missing).
3. In `Visualization.tsx`: `import { FC } from 'react'; interface Props { data: any; } export const Visualization: FC<Props> = ({ data }) => { ... };`.
4. Extract: `const { gaps } = data; const dates = [...new Set(gaps.map(g => g.date))].sort();`.
5. Render table: `<table> <thead><tr><th>Date</th>{data.team.members.map(m => <th key={m.employeeId}>{m.name}</th>)}</tr></thead> <tbody> {dates.map(date => { const rowDate = new Date(date); return <tr key={date}> <td>{rowDate.toDateString()}</td> {data.team.members.map(member => { const avail = member.availability.find(a => a.date.toDateString() === rowDate.toDateString()); const cellClass = !avail?.available ? 'unavailable' : ''; return <td key={member.employeeId} className={cellClass}>{avail?.available ? 'Available' : 'Off'}</td>; })} <td className={gaps.find(g => g.date.toDateString() === rowDate.toDateString())?.isGap ? 'gap' : ''}>Gap: {gaps.find(g => g.date.toDateString() === rowDate.toDateString())?.availableCount || 0}/{data.team.members.length}</td> </tr>; })} </tbody> </table>`.
6. Add basic CSS in `globals.css` or inline: `.unavailable { background: red; } .gap { background: yellow; font-weight: bold; }`.
7. Import and use in page: Ensure dates are handled as strings if needed (use `toISOString()` in backend).
8. Test: Submit a leave, verify table shows red cells for off days, yellow for gaps. Adjust date formatting if mismatches occur.

---

## Phase 6: Integration and Auth Protection (10-15 mins)

1. Ensure Next.js API proxy if needed (but since backend is separate Express, use full `/api/` paths).
2. Add middleware protection: If existing auth uses Next.js middleware, update `middleware.ts` to protect `/time-off-simulator`: `export { default } from 'next-auth/middleware';` or similar, matcher: `/time-off-simulator/:path*`.
3. Handle errors: In frontend, add try-catch in fetches, show `<div>Error: {error}</div>`. In backend, add global error handler if missing.
4. Test end-to-end: Login, visit route, submit leave for overlapping dates, confirm visualization updates without page reload.
5. Edge cases: Test invalid dates (add validation: if start > end, return error), non-existent employee (404 from API).

---
