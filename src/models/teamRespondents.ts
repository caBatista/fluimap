import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { z } from 'zod';

export const TeamRespondentSchemaZod = z.object({
  teamId: z.string(),
  email: z.string().email(),
  role: z.string(),
  createdAt: z.date().optional(),
});
export type TeamRespondentType = z.infer<typeof TeamRespondentSchemaZod>;

const TeamRespondentMongooseSchema: Schema = new Schema(
  {
    teamId: { type: String, required: true },
    email: {
      type: String,
      required: true,
      match: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
    },
    role: { type: String, required: true },
  },
  { timestamps: true }
);

interface ITeamRespondent extends TeamRespondentType, Document {}

function createTeamRespondentModel(): Model<ITeamRespondent> {
  if (mongoose.models.TeamRespondent) {
    return mongoose.models.TeamRespondent as Model<ITeamRespondent>;
  }
  return mongoose.model<ITeamRespondent>('TeamRespondent', TeamRespondentMongooseSchema);
}

const TeamRespondent = createTeamRespondentModel();
export default TeamRespondent;
