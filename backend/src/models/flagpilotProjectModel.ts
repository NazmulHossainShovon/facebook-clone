import mongoose, { Document, Schema } from "mongoose";

export interface IFlagpilotProject extends Document {
  name: string;
  createdAt: Date;
}

const flagpilotProjectSchema = new Schema<IFlagpilotProject>({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const FlagpilotProject = mongoose.model<IFlagpilotProject>(
  "FlagpilotProject",
  flagpilotProjectSchema
);
