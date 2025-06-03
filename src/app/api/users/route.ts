import { NextResponse } from 'next/server';
import connectDB from '@/server/database/db';
import User from '@/models/User';

export async function GET() {
  await connectDB();
  return NextResponse.json(await User.find());
}
