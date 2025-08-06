import { modelOptions, prop, getModelForClass } from "@typegoose/typegoose";

@modelOptions({ schemaOptions: { timestamps: true } })
export class SharedPost {
  @prop({ required: true })
  originalPostId!: string;
  
  @prop({ required: true })
  sharedByUserId!: string;
  
  @prop({ required: true })
  sharedByUserName!: string;
  
  @prop()
  shareMessage?: string; // Optional message when sharing
}

export const SharedPostModel = getModelForClass(SharedPost);