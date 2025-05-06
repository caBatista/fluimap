import mongoose, { Schema, type Model } from 'mongoose';
import { z } from 'zod';

export const OptionZ = z.object({ value: z.string(), label: z.string() });

export const QuestionZ = z.object({
  _id: z.string(),
  text: z.string(),
  type: z.enum(['singleChoice']),
  options: z.array(OptionZ),
  order: z.number(),
});

export const QuestionnaireZ = z.object({
  name: z.string(),
  version: z.string(),
  section: z.enum(['communicationPeers', 'wellBeing', 'jobMeaning']),
  questions: z.array(QuestionZ),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type QuestionnaireType = z.infer<typeof QuestionnaireZ>;

const QuestionnaireSchema = new Schema<QuestionnaireType>(
  {
    name: String,
    version: String,
    section: String,
    questions: [
      {
        _id: String,
        text: String,
        type: String,
        options: [{ value: String, label: String }],
        order: Number,
      },
    ],
  },
  { collection: 'questionnaires', timestamps: true }
);

export default (mongoose.models.Questionnaire as Model<QuestionnaireType>) ||
  mongoose.model<QuestionnaireType>('Questionnaire', QuestionnaireSchema);
