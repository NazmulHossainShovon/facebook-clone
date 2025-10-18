import { modelOptions, prop, getModelForClass } from "@typegoose/typegoose";

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
  @prop({ default: 20 })
  public secondsLeft?: number;
}

export const UserModel = getModelForClass(User);
