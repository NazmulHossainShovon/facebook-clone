import mongoose, { Document, Schema } from "mongoose";

export interface IFlagsmithEnvironment extends Document {
  name: string;
  project: mongoose.Types.ObjectId;
  apiKey: string;
  createdAt: Date;
}

const flagsmithEnvironmentSchema = new Schema<IFlagsmithEnvironment>({
  name: { type: String, required: true },
  project: { type: Schema.Types.ObjectId, ref: "FlagsmithProject", required: true },
  apiKey: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export const FlagsmithEnvironment = mongoose.model<IFlagsmithEnvironment>(
  "FlagsmithEnvironment",
  flagsmithEnvironmentSchema
);
