import mongoose, { Document, Schema } from "mongoose";

export interface IFlagpilotEnvironment extends Document {
  name: string;
  project: mongoose.Types.ObjectId;
  apiKey: string;
  createdAt: Date;
}

const flagpilotEnvironmentSchema = new Schema<IFlagpilotEnvironment>({
  name: { type: String, required: true },
  project: { type: Schema.Types.ObjectId, ref: "FlagpilotProject", required: true },
  apiKey: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export const FlagpilotEnvironment = mongoose.model<IFlagpilotEnvironment>(
  "FlagpilotEnvironment",
  flagpilotEnvironmentSchema
);
