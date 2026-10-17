import mongoose from "mongoose";
import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import { User } from "./userModel";

export type SegmentDestinationType = "google_sheets" | "postgres";

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "segment_destinations",
  },
})
export class SegmentDestination {
  public _id?: string;

  @prop({ ref: () => User, required: true })
  public userId!: Ref<User>;

  @prop({ required: true, enum: ["google_sheets", "postgres"] })
  public type!: SegmentDestinationType;

  @prop({ default: false })
  public enabled?: boolean;

  @prop({ type: () => mongoose.Schema.Types.Mixed, default: {} })
  public config?: Record<string, unknown>;

  @prop({ type: () => [String], default: [] })
  public eventFilters?: string[];
}

export const SegmentDestinationModel = getModelForClass(SegmentDestination);