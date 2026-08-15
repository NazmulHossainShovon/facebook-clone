import mongoose, { Document, Schema } from "mongoose";

export interface IFlagpilotEvaluationLog extends Document {
  flag: mongoose.Types.ObjectId;
  userId: string;
  variantKey: string;
  goalEvent: string;
  converted: boolean;
  timestamp: Date;
}

const flagpilotEvaluationLogSchema = new Schema<IFlagpilotEvaluationLog>({
  flag: { type: Schema.Types.ObjectId, ref: "FlagpilotFeatureFlag", required: true, index: true },
  userId: { type: String, required: true, index: true },
  variantKey: { type: String, required: true },
  goalEvent: { type: String, required: true, index: true },
  converted: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now, expires: "30d" },
});

flagpilotEvaluationLogSchema.index({ flag: 1, userId: 1, goalEvent: 1 }, { unique: true });

export const FlagpilotEvaluationLog = mongoose.model<IFlagpilotEvaluationLog>(
  "FlagpilotEvaluationLog",
  flagpilotEvaluationLogSchema
);
