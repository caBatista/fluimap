import mongoose, { Schema, type Document, type Model } from "mongoose";
import { z } from "zod";

export const FormSchemaZod = z.object({
  teamId: z.string(),
  title: z.string(),
  description: z.string(),
  dateClosing: z.date(),
  questions: z.array(z.string()),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type FormType = z.infer<typeof FormSchemaZod>;

const FormMongooseSchema: Schema = new Schema(
  {
    teamId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dateClosing: { type: Date, required: true },
    questions: { type: [String], required: true },
  },
  { timestamps: true },
);

interface IForm extends FormType, Document {}

function createFormModel(): Model<IForm> {
  if (mongoose.models.Form) {
    return mongoose.models.Form as Model<IForm>;
  }
  return mongoose.model<IForm>("Form", FormMongooseSchema);
}

const Form = createFormModel();
export default Form;
