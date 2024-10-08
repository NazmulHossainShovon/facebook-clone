import { modelOptions, prop, getModelForClass } from "@typegoose/typegoose";

@modelOptions({ schemaOptions: { timestamps: true } })
export class Post {
  _id: string;
  @prop({ required: true })
  post: string;

  @prop({ required: true })
  authorName: string;

  @prop({ required: true })
  userId: string;

  @prop({ required: true })
  likers: string[];
}

export const PostModel = getModelForClass(Post);
