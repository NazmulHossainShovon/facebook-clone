import mongoose, { Document, Schema } from "mongoose";

export type FlagStatus = "active" | "paused" | "archived";

export interface IFlagpilotVariant {
  key: string;
  value: unknown;
  impressions: number;
  conversions: number;
  currentWeight: number;
}

export interface IFlagpilotFeatureFlag extends Document {
  project: mongoose.Types.ObjectId;
  key: string;
  description?: string;
  status: FlagStatus;
  trackedGoals: string[];
  minImpressionsBeforeOptimization: number;
  variants: IFlagpilotVariant[];
  createdAt: Date;
}

const variantSchema = new Schema<IFlagpilotVariant>(
  {
    key: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    impressions: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    currentWeight: { type: Number, default: 0.5 },
  },
  { _id: false }
);

const flagpilotFeatureFlagSchema = new Schema<IFlagpilotFeatureFlag>({
  project: { type: Schema.Types.ObjectId, ref: "FlagpilotProject", required: true, index: true },
  key: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return /^[a-z0-9_]+$/.test(v);
      },
      message: (props: any) => `${props.value} is not a valid slug key`,
    },
  },
  description: { type: String },
  status: { type: String, enum: ["active", "paused", "archived"], default: "active" },
  trackedGoals: [{ type: String }],
  minImpressionsBeforeOptimization: { type: Number, default: 100 },
  variants: { type: [variantSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

flagpilotFeatureFlagSchema.index({ project: 1, key: 1 }, { unique: true });

export const FlagpilotFeatureFlag = mongoose.model<IFlagpilotFeatureFlag>(
  "FlagpilotFeatureFlag",
  flagpilotFeatureFlagSchema
);
