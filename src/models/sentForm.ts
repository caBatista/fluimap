import mongoose, { Schema, type Document, type Model } from "mongoose";
import { z } from "zod";

export const SentFormSchemaZod = z.object({
  formId: z.string(),
  teamId: z.string(),
  email: z.string().email(),
  answered: z.boolean().default(false),
  submittedOn: z.date(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type SentFormType = z.infer<typeof SentFormSchemaZod>;

const SentFormMongooseSchema: Schema = new Schema(
  {
    formId: { type: String, required: true },
    teamId: { type: String, required: true },
    email: {
      type: String,
      required: true,
      match: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
    },
    answered: { type: Boolean, required: true, default: false },
    submittedOn: { type: Date, required: true },
  },
  { timestamps: true },
);

interface ISentForm extends SentFormType, Document {}

function createSentFormModel(): Model<ISentForm> {
  if (mongoose.models.SentForm) {
    return mongoose.models.SentForm as Model<ISentForm>;
  }
  return mongoose.model<ISentForm>("SentForm", SentFormMongooseSchema);
}

const SentForm = createSentFormModel();
export default SentForm;
