import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { z } from 'zod';

export const OptionZ = z.object({ value: z.string(), label: z.string() });
export const QuestionZ = z.object({
  _id: z.string(),
  text: z.string(),
  type: z.literal('singleChoice'),
  options: z.array(OptionZ),
  order: z.number(),
});
export const QuestionnaireZ = z.object({
  name: z.string(),
  version: z.string(),
  section: z.enum(['jobMeaning', 'communicationPeers', 'wellBeing']),
  instructions: z.string(),
  questions: z.array(QuestionZ),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type QuestionnaireType = z.infer<typeof QuestionnaireZ>;

interface IQuestionnaire extends QuestionnaireType, Document {}

const QuestionnaireSchema = new Schema<IQuestionnaire>(
  {
    name: { type: String, required: true },
    version: { type: String, required: true },
    section: {
      type: String,
      required: true,
      enum: ['jobMeaning', 'communicationPeers', 'wellBeing'],
    },
    instructions: { type: String, required: true },
    questions: [
      {
        _id: { type: String, required: true },
        text: { type: String, required: true },
        type: { type: String, required: true },
        options: [{ value: String, label: String }],
        order: { type: Number, required: true },
      },
    ],
  },
  { collection: 'questionnaires', timestamps: true }
);

export default (mongoose.models.Questionnaire as Model<IQuestionnaire>) ??
  mongoose.model<IQuestionnaire>('Questionnaire', QuestionnaireSchema);
