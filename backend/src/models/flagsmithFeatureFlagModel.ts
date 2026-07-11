import mongoose, { Document, Schema } from "mongoose";

export type FeatureFlagType = "BOOLEAN" | "STRING";

export interface IFlagsmithFeatureFlag extends Document {
  environment: mongoose.Types.ObjectId;
  key: string;
  name: string;
  description?: string;
  type: FeatureFlagType;
  enabled: boolean;
  value: string;
  createdAt: Date;
}

const flagsmithFeatureFlagSchema = new Schema<IFlagsmithFeatureFlag>({
  environment: { type: Schema.Types.ObjectId, ref: "FlagsmithEnvironment", required: true },
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
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ["BOOLEAN", "STRING"], default: "BOOLEAN" },
  enabled: { type: Boolean, default: false },
  value: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

// Compound unique index to prevent duplicate keys per environment
flagsmithFeatureFlagSchema.index({ environment: 1, key: 1 }, { unique: true });

export const FlagsmithFeatureFlag = mongoose.model<IFlagsmithFeatureFlag>(
  "FlagsmithFeatureFlag",
  flagsmithFeatureFlagSchema
);
