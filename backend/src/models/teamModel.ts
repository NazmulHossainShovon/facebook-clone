import { modelOptions, prop, getModelForClass } from "@typegoose/typegoose";

export class TeamMember {
  @prop({ required: true })
  public employeeId!: string;

  @prop({ required: true })
  public name!: string;

  @prop({ required: true })
  public role!: string;

  @prop({ type: () => [Date] })
  public leaveDates!: Date[];
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class Team {
  public _id?: string;

  @prop({ required: true, unique: false })
  public teamId!: string;

  @prop({ required: true })
  public userId!: string;

  @prop({ type: () => [TeamMember] })
  public members!: TeamMember[];
}

export const TeamModel = getModelForClass(Team);
