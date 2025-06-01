import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { z } from 'zod';

export const PaymentSchemaZod = z.object({
  userId: z.string(),
  amount: z.number().positive(),
  creditsGranted: z.number().positive(),
  paymentMethod: z.string(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  transactionId: z.string(),
  paymentGateway: z.string(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type PaymentType = z.infer<typeof PaymentSchemaZod>;

const PaymentMongooseSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    creditsGranted: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentGateway: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

PaymentMongooseSchema.index({ userId: 1, createdAt: -1 });
PaymentMongooseSchema.index({ transactionId: 1 });
PaymentMongooseSchema.index({ status: 1 });

interface IPayment extends PaymentType, Document {}

function createPaymentModel(): Model<IPayment> {
  if (mongoose.models.Payment) {
    return mongoose.models.Payment as Model<IPayment>;
  }
  return mongoose.model<IPayment>('Payment', PaymentMongooseSchema);
}

const Payment = createPaymentModel();
export default Payment;
