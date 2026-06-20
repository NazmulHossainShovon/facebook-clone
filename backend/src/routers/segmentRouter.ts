import express from "express";
import asyncHandler from "express-async-handler";
import { isAuth } from "../utils";

import {
  registerHandler,
  loginHandler,
  meHandler,
  getDestinationsHandler,
  updateDestinationHandler,
  trackEventHandler,
  recentEventsHandler,
  retryEventHandler,
} from "./segment";

export const segmentRouter = express.Router();

segmentRouter.post("/auth/register", asyncHandler(registerHandler));
segmentRouter.post("/auth/login", asyncHandler(loginHandler));
segmentRouter.get("/auth/me", isAuth, asyncHandler(meHandler));

segmentRouter.get("/destinations", isAuth, asyncHandler(getDestinationsHandler));
segmentRouter.put("/destinations/:id", isAuth, asyncHandler(updateDestinationHandler));

segmentRouter.post("/events/track", asyncHandler(trackEventHandler));
segmentRouter.get("/events/recent", isAuth, asyncHandler(recentEventsHandler));
segmentRouter.post("/events/:id/retry", isAuth, asyncHandler(retryEventHandler));