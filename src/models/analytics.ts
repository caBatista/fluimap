import mongoose, { Schema, type Document, type Model } from "mongoose";
import { z } from "zod";

export const AnalyticsSchemaZod = z.object({
  formId: z.string(),
  totalReplies: z.number(),
  statistics: z.record(z.any()),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type AnalyticsType = z.infer<typeof AnalyticsSchemaZod>;

const AnalyticsMongooseSchema: Schema = new Schema(
  {
    formId: { type: String, required: true },
    totalReplies: { type: Number, required: true },
    statistics: { type: Object, required: true },
  },
  { timestamps: true },
);

interface IAnalytics extends AnalyticsType, Document {}

function createAnalyticsModel(): Model<IAnalytics> {
  if (mongoose.models.Analytics) {
    return mongoose.models.Analytics as Model<IAnalytics>;
  }
  return mongoose.model<IAnalytics>("Analytics", AnalyticsMongooseSchema);
}

const Analytics = createAnalyticsModel();
export default Analytics;
