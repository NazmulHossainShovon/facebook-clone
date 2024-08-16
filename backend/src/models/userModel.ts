import { modelOptions, prop, getModelForClass } from "@typegoose/typegoose";

@modelOptions({ schemaOptions: { timestamps: true } })
export class User {
  public _id?: string;
  @prop({ required: true, unique: true })
  public name!: string;
  @prop({ required: true, unique: true })
  public email!: string;
  @prop({ required: true })
  public password!: string;
  @prop()
  public image?: string;
  @prop()
  public receivedFriendReqs: string[];
  @prop()
  public sentFriendReqs: string[];
}

export const UserModel = getModelForClass(User);
