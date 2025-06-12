import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? '');

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null || !('prompt' in body)) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    const prompt = (body as { prompt: unknown }).prompt;

    if (typeof prompt !== 'string' && !Array.isArray(prompt)) {
      return NextResponse.json({ error: 'Prompt must be a string or array' }, { status: 400 });
    }

    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error in Gemini API:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
