import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { z } from 'zod';

export const SurveySchemaZod = z.object({
  title: z.string().min(2, 'Título precisa ter pelo menos 2 caracteres.'),
  description: z.string().optional(),
  teamId: z.string().min(1, 'Selecione um time.'),
  status: z.enum(['ativo', 'fechado']),
  dateClosing: z.preprocess((val) => {
    if (typeof val === 'string' || val instanceof Date) {
      return new Date(val);
    }
    return val;
  }, z.date()),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type SurveyType = z.infer<typeof SurveySchemaZod>;

interface ISurvey extends SurveyType, Document {}

const SurveySchema = new Schema<ISurvey>(
  {
    title: { type: String, required: true },
    description: { type: String },
    teamId: { type: String, required: true },
    status: {
      type: String,
      enum: ['ativo', 'fechado'],
    },
    dateClosing: { type: Date, required: true, default: undefined },
  },
  { timestamps: true }
);

function createSurveyModel(): Model<ISurvey> {
  if (mongoose.models.Survey) {
    return mongoose.models.Survey as Model<ISurvey>;
  }
  return mongoose.model<ISurvey>('Survey', SurveySchema);
}

const Survey = createSurveyModel();
export default Survey;
