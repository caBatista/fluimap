import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import dbConnect from '@/server/database/db';
import User from '@/models/User';
import CreditTransaction from '@/models/CreditTransaction';

const PlaceBetSchema = z.object({
  betAmount: z.number().positive().min(1),
});

const SYMBOLS = ['🐅', '💎', '🍀', '🎰'];

const PAYOUT_MULTIPLIERS: Record<string, number> = {
  '🐅': 10, // Tiger - 10x (highest)
  '💎': 5, // Diamond - 5x (high)
  '🍀': 3, // Lucky - 3x (medium)
  '🎰': 2, // Slot - 2x (low)
};

// Weighted symbol selection for more realistic odds
const SYMBOL_WEIGHTS: Record<string, number> = {
  '🐅': 5, // Tiger - rare (5% chance)
  '💎': 15, // Diamond - uncommon (15% chance)
  '🍀': 30, // Lucky - common (30% chance)
  '🎰': 50, // Slot - very common (50% chance)
};

function getWeightedRandomSymbol(): string {
  const totalWeight = Object.values(SYMBOL_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (const [symbol, weight] of Object.entries(SYMBOL_WEIGHTS)) {
    random -= weight;
    if (random <= 0) {
      return symbol;
    }
  }

  return '🎰'; // fallback
}

function isPrime(num: number): boolean {
  if (num < 2) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;

  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}

function generateSlotResult(betAmount: number): {
  symbols: string[];
  won: boolean;
  multiplier: number;
} {
  // Hidden rule: If bet amount is a prime number, always win with Tiger (highest multiplier)
  if (isPrime(betAmount) && betAmount !== 5) {
    const symbols = ['🐅', '🐅', '🐅'];
    return { symbols, won: true, multiplier: PAYOUT_MULTIPLIERS['🐅'] ?? 0 };
  }

  // Normal random generation
  const symbols = [getWeightedRandomSymbol(), getWeightedRandomSymbol(), getWeightedRandomSymbol()];

  // Check if all three symbols are the same
  const won = symbols[0] === symbols[1] && symbols[1] === symbols[2];
  const multiplier = won && symbols[0] ? (PAYOUT_MULTIPLIERS[symbols[0]] ?? 0) : 0;

  return { symbols, won, multiplier };
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: unknown = await request.json();
    const { betAmount } = PlaceBetSchema.parse(body);

    await dbConnect();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has enough credits
    if (user.credits < betAmount) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    }

    // Generate slot result
    const { symbols, won, multiplier } = generateSlotResult(betAmount);

    let newBalance = user.credits - betAmount;
    let winAmount = 0;

    if (won) {
      winAmount = betAmount * multiplier;
      newBalance += winAmount;
    }

    // Update user credits
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: { credits: newBalance } },
      { new: true, runValidators: false }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update user credits' }, { status: 500 });
    }

    // Create credit transaction for the bet
    const betTransaction = new CreditTransaction({
      userId: user._id,
      type: 'usage',
      amount: -betAmount,
      description: `Fortune Tiger bet - ${betAmount} credits`,
      balanceAfter: won ? user.credits - betAmount + winAmount : user.credits - betAmount,
    });

    await betTransaction.save();

    // Create credit transaction for the win (if applicable)
    if (won && winAmount > 0) {
      const winTransaction = new CreditTransaction({
        userId: user._id,
        type: 'refund', // Using refund type for winnings
        amount: winAmount,
        description: `Fortune Tiger win - ${symbols.join('')} - ${winAmount} credits`,
        balanceAfter: newBalance,
      });

      await winTransaction.save();
    }

    return NextResponse.json({
      success: true,
      won,
      betAmount,
      winAmount: won ? winAmount : undefined,
      newBalance,
      symbols,
    });
  } catch (error) {
    console.error('Error placing bet:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
