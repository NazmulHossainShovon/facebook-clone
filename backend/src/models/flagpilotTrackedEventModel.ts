import mongoose, { Document, Schema } from "mongoose";

export interface IFlagpilotTrackedEvent extends Document {
  eventId: string;
  createdAt: Date;
}

const flagpilotTrackedEventSchema = new Schema<IFlagpilotTrackedEvent>({
  eventId: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now, expires: "1d" }, // Auto TTL-cleanup after 1 day
});

export const FlagpilotTrackedEvent = mongoose.model<IFlagpilotTrackedEvent>(
  "FlagpilotTrackedEvent",
  flagpilotTrackedEventSchema
);
