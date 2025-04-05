import mongoose, { Schema, type Document, type Model } from "mongoose";
import { z } from "zod";

export const ResponseSchemaZod = z.object({
  formId: z.string(),
  email: z.string().email(),
  answers: z.array(z.string()),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type ResponseType = z.infer<typeof ResponseSchemaZod>;

const ResponseMongooseSchema: Schema = new Schema(
  {
    formId: { type: String, required: true },
    email: {
      type: String,
      required: true,
      match: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
    },
    answers: { type: [String], required: true },
  },
  { timestamps: true },
);

interface IResponse extends ResponseType, Document {}

function createResponseModel(): Model<IResponse> {
  if (mongoose.models.Response) {
    return mongoose.models.Response as Model<IResponse>;
  }
  return mongoose.model<IResponse>("Response", ResponseMongooseSchema);
}

const Response = createResponseModel();
export default Response;
