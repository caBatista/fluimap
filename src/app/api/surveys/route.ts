import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/server/db";
import Survey, { SurveySchemaZod } from "@/models/Survey";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    await dbConnect();
    const surveys = await Survey.find().sort({ createdAt: -1 });
    return NextResponse.json({ surveys }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch surveys" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();

    const parseResult = SurveySchemaZod.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error }, { status: 400 });
    }

    const newSurvey = await Survey.create(parseResult.data);
    return NextResponse.json({ survey: newSurvey }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create survey" },
      { status: 500 },
    );
  }
}
