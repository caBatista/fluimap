import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { PaymentSimulator } from '@/lib/payment-simulator';

const CreatePaymentIntentSchema = z.object({
  amount: z.number().positive(),
  credits: z.number().positive(),
  paymentMethod: z.enum(['card', 'paypal']).default('card'),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: unknown = await request.json();
    const { amount, credits, paymentMethod } = CreatePaymentIntentSchema.parse(body);

    const paymentIntent = PaymentSimulator.createPaymentIntent(amount, credits, {
      paymentMethod,
      userId,
    });

    return NextResponse.json({
      paymentIntent,
      clientSecret: paymentIntent.clientSecret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
