import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { z } from 'zod';

export const SubscriptionPlanSchemaZod = z.object({
  name: z.string(),
  tier: z.enum(['free', 'basic', 'premium', 'enterprise']),
  monthlyCredits: z.number().min(0),
  pricePerMonth: z.number().min(0),
  pricePerCredit: z.number().min(0),
  features: z.array(z.string()),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type SubscriptionPlanType = z.infer<typeof SubscriptionPlanSchemaZod>;

const SubscriptionPlanMongooseSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    tier: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      required: true,
      unique: true,
    },
    monthlyCredits: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePerMonth: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePerCredit: {
      type: Number,
      required: true,
      min: 0,
    },
    features: [
      {
        type: String,
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

SubscriptionPlanMongooseSchema.index({ tier: 1 });
SubscriptionPlanMongooseSchema.index({ isActive: 1 });

interface ISubscriptionPlan extends SubscriptionPlanType, Document {}

function createSubscriptionPlanModel(): Model<ISubscriptionPlan> {
  if (mongoose.models.SubscriptionPlan) {
    return mongoose.models.SubscriptionPlan as Model<ISubscriptionPlan>;
  }
  return mongoose.model<ISubscriptionPlan>('SubscriptionPlan', SubscriptionPlanMongooseSchema);
}

const SubscriptionPlan = createSubscriptionPlanModel();
export default SubscriptionPlan;
