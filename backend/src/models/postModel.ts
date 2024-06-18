import {
  modelOptions,
  prop,
  getModelForClass,
  Ref,
} from "@typegoose/typegoose";
import { User } from "./userModel";

@modelOptions({ schemaOptions: { timestamps: true } })
export class Post {
  @prop({ required: true })
  post: string;

  @prop({ ref: User })
  user: Ref<User>;
}

export const PostModel = getModelForClass(Post);
