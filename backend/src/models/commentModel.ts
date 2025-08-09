import { modelOptions, prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { Post } from "./postModel";
import { User } from "./userModel";

@modelOptions({ schemaOptions: { timestamps: true } })
export class Comment {
  @prop({ ref: () => Post, required: true })
  public postId!: Ref<Post>;

  @prop({ ref: () => User, required: true })
  public userId!: Ref<User>;

  @prop({ required: true })
  public content!: string;

  @prop({ ref: () => User, default: [] })
  public likes?: Ref<User>[];
}

export const CommentModel = getModelForClass(Comment);
