import { Request, Response } from "express";
import {
  SegmentDestinationModel,
  SegmentDestination,
} from "../../models/segmentDestinationModel";
import { seedDestinations, validateDestinationConfig } from "./helpers";

export const getDestinationsHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  let destinations = await SegmentDestinationModel.find({ userId }).lean();
  if (destinations.length === 0) {
    await seedDestinations(userId);
    destinations = await SegmentDestinationModel.find({ userId }).lean();
  }

  res.json(destinations);
};

export const updateDestinationHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const destination = await SegmentDestinationModel.findOne({
    _id: req.params.id,
    userId,
  });

  if (!destination) {
    res.status(404).json({ message: "Destination not found" });
    return;
  }

  if (req.body.enabled !== undefined) {
    destination.enabled = Boolean(req.body.enabled);
  }

  if (req.body.eventFilters !== undefined) {
    if (!Array.isArray(req.body.eventFilters)) {
      res.status(400).json({ message: "eventFilters must be an array" });
      return;
    }

    const validFilters = req.body.eventFilters
      .map((item: unknown) => String(item || "").trim())
      .filter((item: string) => item.length > 0);
    destination.eventFilters = validFilters;
  }

  if (req.body.config !== undefined) {
    const mergedConfig = {
      ...(destination.config || {}),
      ...(req.body.config || {}),
    } as Record<string, unknown>;

    destination.config = validateDestinationConfig(destination.type as SegmentDestination['type'], mergedConfig);
  }

  const updated = await destination.save();
  res.json(updated);
};
