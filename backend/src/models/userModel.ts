import { modelOptions, prop, getModelForClass } from "@typegoose/typegoose";
import {
  DEFAULT_SECONDS_LEFT,
  DEFAULT_CHARTS_LIMIT,
  DEFAULT_DPS_CALC_LIMIT,
  DEFAULT_TIME_OFF_TIER,
} from "../constants/userConstants";

@modelOptions({ schemaOptions: { timestamps: true } })
export class User {
  public _id?: string;
  @prop({ required: true, unique: true })
  public name!: string;
  @prop({ required: true, unique: true })
  public email!: string;
  @prop({ required: false })
  public password?: string;
  @prop()
  public profileImage?: string;
  @prop()
  public googleId?: string;
  @prop({ default: "local" })
  public authProvider?: string;
  @prop()
  public receivedFriendReqs!: string[];
  @prop()
  public sentFriendReqs!: string[];
  @prop()
  public friends!: string[];

  // Paddle payment fields
  @prop({ default: DEFAULT_SECONDS_LEFT })
  public secondsLeft?: number;

  @prop({ default: DEFAULT_CHARTS_LIMIT })
  public remainingChartsLimit?: number;

  @prop({ default: DEFAULT_DPS_CALC_LIMIT })
  public remainingDpsCalcLimit?: number;

  @prop({ default: DEFAULT_TIME_OFF_TIER })
  public timeOffAppTier?: number;
}

export const UserModel = getModelForClass(User);
