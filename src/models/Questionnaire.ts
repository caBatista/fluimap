import mongoose, { Schema, type Model } from 'mongoose';
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
  section: z.enum(['communicationPeers', 'wellBeing', 'jobMeaning']),
  instructions: z.string().optional(),
  questions: z.array(QuestionZ),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type QuestionnaireType = z.infer<typeof QuestionnaireZ>;

const OptionSchema = new Schema(
  {
    value: { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
);

const QuestionSchema = new Schema(
  {
    _id: { type: String, required: true },
    text: { type: String, required: true },
    type: { type: String, enum: ['singleChoice'], required: true },
    options: { type: [OptionSchema], required: true },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const QuestionnaireSchema = new Schema<QuestionnaireType>(
  {
    name: { type: String, required: true },
    version: { type: String, required: true },
    section: {
      type: String,
      enum: ['communicationPeers', 'wellBeing', 'jobMeaning'],
      required: true,
    },
    instructions: { type: String },
    questions: { type: [QuestionSchema], required: true },
  },
  {
    collection: 'questionnaires',
    timestamps: true,
    strict: true,
  }
);

export default (mongoose.models.Questionnaire as Model<IQuestionnaire>) ??
  mongoose.model<IQuestionnaire>('Questionnaire', QuestionnaireSchema);
