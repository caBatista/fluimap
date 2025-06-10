import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import dbConnect from '@/server/database/db';
import User from '@/models/User';
import Payment from '@/models/Payment';
import CreditTransaction from '@/models/CreditTransaction';
import { PaymentSimulator } from '@/lib/payment-simulator';

const ConfirmPaymentSchema = z.object({
  paymentIntentId: z.string(),
  paymentMethodId: z.string(),
  cardNumber: z.string().optional(),
  amount: z.number().positive(),
  credits: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: unknown = await request.json();
    const { paymentIntentId, paymentMethodId, cardNumber, amount, credits } =
      ConfirmPaymentSchema.parse(body);

    await dbConnect();

    // Simulate payment processing
    const paymentResult = await PaymentSimulator.simulatePayment(
      paymentIntentId,
      paymentMethodId,
      cardNumber
    );

    if (!paymentResult.success) {
      return NextResponse.json({
        success: false,
        error: paymentResult.error,
        paymentIntent: paymentResult.paymentIntent,
      });
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const payment = new Payment({
      userId: user._id,
      amount,
      creditsGranted: credits,
      paymentMethod: 'card',
      status: 'completed',
      transactionId: PaymentSimulator.generateTransactionId(),
      paymentGateway: 'stripe-sim',
      metadata: {
        paymentIntentId,
        paymentMethodId,
      },
    });

    await payment.save();

    // Update user credits using findOneAndUpdate to avoid validation issues
    const previousBalance = user.credits || 0;
    const newBalance = previousBalance + credits;
    const newTotalCreditsEverPurchased = (user.totalCreditsEverPurchased || 0) + credits;

    // Set expiration date (1 year from now)
    const creditsExpirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $set: {
          credits: newBalance,
          lastCreditsPurchase: new Date(),
          totalCreditsEverPurchased: newTotalCreditsEverPurchased,
          creditsExpirationDate: creditsExpirationDate,
        },
      },
      { new: true, runValidators: false }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update user credits' }, { status: 500 });
    }

    const creditTransaction = new CreditTransaction({
      userId: user._id,
      type: 'purchase',
      amount: credits,
      description: `Credit purchase - ${credits} credits`,
      relatedPaymentId: payment._id,
      balanceAfter: newBalance,
    });

    await creditTransaction.save();

    return NextResponse.json({
      success: true,
      paymentIntent: paymentResult.paymentIntent,
      creditsAdded: credits,
      newBalance: newBalance,
    });
  } catch (error) {
    console.error('Error confirming payment:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
