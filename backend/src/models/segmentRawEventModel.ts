import mongoose from "mongoose";
import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import { User } from "./userModel";

@modelOptions({
  schemaOptions: {
    collection: "segment_raw_events",
  },
})
export class SegmentRawEvent {
  public _id?: string;

  @prop({ ref: () => User, required: true })
  public userId!: Ref<User>;

  @prop({ required: true })
  public eventName!: string;

  @prop()
  public externalUserId?: string;

  @prop({ type: () => mongoose.Schema.Types.Mixed, default: {} })
  public properties?: Record<string, unknown>;

  @prop()
  public ipAddress?: string;

  @prop({ default: false })
  public processed?: boolean;

  @prop({ default: 0 })
  // removed per-destination counters (kept minimal event state)

  @prop()
  public lastError?: string;

  @prop()
  public lastFailedDestinationId?: string;

  @prop({ default: 0 })
  public lastRetryCount?: number;

  @prop({ default: Date.now })
  public createdAt?: Date;
}

export const SegmentRawEventModel = getModelForClass(SegmentRawEvent);