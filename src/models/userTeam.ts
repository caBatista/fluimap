import mongoose, { Schema, type Document, type Model } from "mongoose";
import { z } from "zod";

// 1. Zod Schema Definition
export const UserTeamSchemaZod = z.object({
  userId: z.string(),
  teamId: z.string(),
  createdAt: z.date().optional(),
});
export type UserTeamType = z.infer<typeof UserTeamSchemaZod>;

// 2. Mongoose Schema Definition
const UserTeamMongooseSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    teamId: { type: String, required: true },
  },
  { timestamps: true },
);

// 3. Mongoose Model Definition
interface IUserTeam extends UserTeamType, Document {}

function createUserTeamModel(): Model<IUserTeam> {
  if (mongoose.models.UserTeam) {
    return mongoose.models.UserTeam as Model<IUserTeam>;
  }
  return mongoose.model<IUserTeam>("UserTeam", UserTeamMongooseSchema);
}

const UserTeam = createUserTeamModel();
export default UserTeam;
