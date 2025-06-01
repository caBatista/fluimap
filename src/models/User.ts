import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { z } from 'zod';

export const UserSchemaZod = z.object({
  clerkId: z.string(),
  name: z.string(),
  email: z.string().email(),
  // type: z.enum(["lead", "rh"]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type UserType = z.infer<typeof UserSchemaZod>;

const UserMongooseSchema: Schema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      match: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
    },
    // type: { type: String, required: true, enum: ["lead", "rh"] },
  },
  { timestamps: true }
);

interface IUser extends UserType, Document {}

function createUserModel(): Model<IUser> {
  if (mongoose.models.User) {
    return mongoose.models.User as Model<IUser>;
  }
  return mongoose.model<IUser>('User', UserMongooseSchema);
}

const User = createUserModel();
export default User;
