import mongoose, { Schema, type Document, type Model } from "mongoose";
import { z } from "zod";

export const TeamSchemaZod = z.object({
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type TeamType = z.infer<typeof TeamSchemaZod>;

const TeamMongooseSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true },
);

interface ITeam extends TeamType, Document {}

function createTeamModel(): Model<ITeam> {
  if (mongoose.models.Team) {
    return mongoose.models.Team as Model<ITeam>;
  }
  return mongoose.model<ITeam>("Team", TeamMongooseSchema);
}

const Team = createTeamModel();
export default Team;
