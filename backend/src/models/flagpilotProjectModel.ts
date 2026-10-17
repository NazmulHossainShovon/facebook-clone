import mongoose, { Document, Schema } from "mongoose";

export interface IFlagpilotProject extends Document {
  name: string;
  orgId: mongoose.Types.ObjectId;
  apiKey: string;
  createdAt: Date;
}

const flagpilotProjectSchema = new Schema<IFlagpilotProject>({
  name: { type: String, required: true },
  orgId: { type: Schema.Types.ObjectId, required: true, index: true },
  apiKey: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export const FlagpilotProject = mongoose.model<IFlagpilotProject>(
  "FlagpilotProject",
  flagpilotProjectSchema
);
