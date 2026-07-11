import mongoose, { Document, Schema } from "mongoose";

export interface IFlagsmithProject extends Document {
  name: string;
  createdAt: Date;
}

const flagsmithProjectSchema = new Schema<IFlagsmithProject>({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const FlagsmithProject = mongoose.model<IFlagsmithProject>(
  "FlagsmithProject",
  flagsmithProjectSchema
);
