import { Request, Response } from "express";
import { UserModel } from "../../models/userModel";
import {
  SegmentDestinationModel,
  SegmentDestination,
} from "../../models/segmentDestinationModel";
import { SegmentRawEventModel } from "../../models/segmentRawEventModel";
import {
  getIpAddress,
  appendToGoogleSheets,
  appendToPostgres,
  shouldForwardEvent,
} from "./helpers";

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

  const rawEvent = await SegmentRawEventModel.create({
    userId: (user as any)._id,
    eventName,
    externalUserId,
    properties,
    ipAddress: getIpAddress(req),
    processed: false,
    createdAt: new Date(),
  });

  const destinations = await SegmentDestinationModel.find({
    userId: (user as any)._id,
    enabled: true,
  }).lean();

  const createdAt = rawEvent.createdAt || new Date();
  const forwardingJobs = destinations
    .filter(destination => shouldForwardEvent(eventName, destination.eventFilters))
    .map(async destination => {
      if (destination.type === "google_sheets") {
        await appendToGoogleSheets(destination as SegmentDestination, {
          eventName,
          externalUserId,
          properties,
          createdAt,
        });
        return;
      }

      await appendToPostgres(destination as SegmentDestination, {
        eventName,
        externalUserId,
        properties,
        createdAt,
      });
    });

  Promise.allSettled(forwardingJobs)
    .then(results => {
      results.forEach(result => {
        if (result.status === "rejected") {
          console.error("Segment destination forwarding error:", result.reason);
        }
      });
    })
    .catch(error => {
      console.error("Segment forwarding batch error:", error);
    })
    .finally(async () => {
      await SegmentRawEventModel.findByIdAndUpdate(rawEvent._id, {
        processed: true,
      });
    });

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
