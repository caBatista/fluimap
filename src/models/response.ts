import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { z } from 'zod';

export const ResponseSchemaZod = z.object({
  surveyId: z.string(),
  questionnaireId: z.string(),
  email: z.string().email(),
  answersByUser: z.array(
    z.object({
      name: z.string(),
      answers: z.record(z.string(), z.string())
    })
  ),
});

export type ResponseType = z.infer<typeof ResponseSchemaZod>;

const ResponseMongooseSchema: Schema = new Schema(
  {
    surveyId: { type: String, required: true, ref: 'Survey' },
    questionnaireId: { type: String, required: true, ref: 'Questionnaire' },
    email: {
      type: String,
      required: true,
      match: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
    },
    answersByUser: [
      {
        name: { type: String, required: true },
        answers: { type: Map, of: String, required: true },
      },
    ],
  },
  { collection: 'responses', timestamps: true }
);

interface IResponse extends ResponseType, Document {}

function createResponseModel(): Model<IResponse> {
  if (mongoose.models.Response) {
    return mongoose.models.Response as Model<IResponse>;
  }
  return mongoose.model<IResponse>('Response', ResponseMongooseSchema);
}

const Response = createResponseModel();
export default Response;
