import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { z } from 'zod';

export const SurveySchemaZod = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  teamId: z.string(),
  status: z.enum(['ativo', 'fechado']),
  questionnaireId: z.string(),
  dateClosing: z.preprocess(
    (v) => (typeof v === 'string' || v instanceof Date ? new Date(v) : v),
    z.date()
  ),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type SurveyType = z.infer<typeof SurveySchemaZod>;

interface ISurvey extends SurveyType, Document {}

const SurveySchema = new Schema<ISurvey>(
  {
    title: String,
    description: String,
    teamId: { type: String, required: true },
    status: { type: String, enum: ['ativo', 'fechado'], required: true },
    questionnaireId: { type: String, required: true, ref: 'Questionnaire' },
    dateClosing: Date,
  },
  { collection: 'surveys', timestamps: true }
);

export default (mongoose.models.Survey as Model<ISurvey>) ??
  mongoose.model<ISurvey>('Survey', SurveySchema);
