import { modelOptions, prop, getModelForClass } from "@typegoose/typegoose";

export class Availability {
  @prop({ required: true })
  public date!: Date;

  @prop({ default: true })
  public available!: boolean;
}

export class TeamMember {
  @prop({ required: true })
  public employeeId!: string;

  @prop({ required: true })
  public name!: string;

  @prop({ required: true })
  public role!: string;

  @prop({ type: () => [Availability] })
  public availability!: Availability[];
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class Team {
  public _id?: string;

  @prop({ required: true, unique: true })
  public teamId!: string;

  @prop({ type: () => [TeamMember] })
  public members!: TeamMember[];
}

export const TeamModel = getModelForClass(Team);