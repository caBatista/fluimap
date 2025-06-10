import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { z } from 'zod';

export const CreditTransactionSchemaZod = z.object({
  userId: z.string(),
  type: z.enum(['purchase', 'usage', 'refund', 'expiration']),
  amount: z.number(),
  description: z.string(),
  relatedPaymentId: z.string().optional(),
  relatedSurveyId: z.string().optional(),
  balanceAfter: z.number().min(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type CreditTransactionType = z.infer<typeof CreditTransactionSchemaZod>;

const CreditTransactionMongooseSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['purchase', 'usage', 'refund', 'expiration'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    relatedPaymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: false,
    },
    relatedSurveyId: {
      type: Schema.Types.ObjectId,
      ref: 'Survey',
      required: false,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

CreditTransactionMongooseSchema.index({ userId: 1, createdAt: -1 });
CreditTransactionMongooseSchema.index({ type: 1 });
CreditTransactionMongooseSchema.index({ relatedPaymentId: 1 });
CreditTransactionMongooseSchema.index({ relatedSurveyId: 1 });

interface ICreditTransaction extends CreditTransactionType, Document {}

function createCreditTransactionModel(): Model<ICreditTransaction> {
  if (mongoose.models.CreditTransaction) {
    return mongoose.models.CreditTransaction as Model<ICreditTransaction>;
  }
  return mongoose.model<ICreditTransaction>('CreditTransaction', CreditTransactionMongooseSchema);
}

const CreditTransaction = createCreditTransactionModel();
export default CreditTransaction;
