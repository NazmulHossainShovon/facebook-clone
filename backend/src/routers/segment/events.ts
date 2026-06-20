import { Request, Response } from "express";
import { UserModel } from "../../models/userModel";
import {
  SegmentDestinationModel,
  SegmentDestination,
} from "../../models/segmentDestinationModel";
import { SegmentRawEventModel } from "../../models/segmentRawEventModel";
import { getIpAddress, shouldForwardEvent } from "./helpers";
import { segmentQueue } from "../../queues/segmentQueue";

// ensure worker is started
import "../../queues/segmentWorker";

export const trackEventHandler = async (req: Request, res: Response) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing API key" });
    return;
  }

  const apiKey = authorization.slice(7).trim();
  const user = await UserModel.findOne({ apiKey }).lean();
  if (!user) {
    res.status(401).json({ message: "Invalid API key" });
    return;
  }

  const eventName = String(req.body.event || "").trim();
  const externalUserId = req.body.userId !== undefined ? String(req.body.userId) : undefined;
  const properties = req.body.properties && typeof req.body.properties === "object" ? req.body.properties : {};

  if (!eventName) {
    res.status(400).json({ message: "event is required" });
    return;
  }

  const destinations = await SegmentDestinationModel.find({
    userId: (user as any)._id,
    enabled: true,
  }).lean();

  const filtered = destinations.filter(destination => shouldForwardEvent(eventName, destination.eventFilters));

  const rawEvent = await SegmentRawEventModel.create({
    userId: (user as any)._id,
    eventName,
    externalUserId,
    properties,
    ipAddress: getIpAddress(req),
    processed: filtered.length === 0, // if no destinations, mark processed
    pendingDestinations: filtered.length,
    createdAt: new Date(),
  });

  const createdAt = rawEvent.createdAt || new Date();

  // enqueue forwarding jobs for each destination
  for (const destination of filtered) {
    // job data
    const jobData = {
      destination: destination as SegmentDestination,
      payload: { eventName, externalUserId, properties, createdAt },
      rawEventId: String(rawEvent._id),
      retryCount: 0,
    };

    await segmentQueue.add('forward', jobData, { removeOnComplete: true });
  }

  res.json({ success: true, eventId: rawEvent._id });
};

export const recentEventsHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const events = await SegmentRawEventModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.json(events);
};
