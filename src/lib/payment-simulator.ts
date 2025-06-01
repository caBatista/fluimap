import { randomBytes } from 'crypto';

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  credits: number;
  status:
    | 'requires_payment_method'
    | 'requires_confirmation'
    | 'processing'
    | 'succeeded'
    | 'canceled';
  paymentMethod?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_transfer';
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  paypal?: {
    email: string;
  };
}

export interface PaymentResult {
  success: boolean;
  paymentIntent: PaymentIntent;
  error?: string;
}

interface TestCard {
  brand: string;
  success: boolean;
  error?: string;
}

export class PaymentSimulator {
  private static readonly TEST_CARDS: Record<string, TestCard> = {
    '4242424242424242': { brand: 'visa', success: true },
    '4000000000000002': { brand: 'visa', success: false, error: 'card_declined' },
    '4000000000009995': { brand: 'visa', success: false, error: 'insufficient_funds' },
    '5555555555554444': { brand: 'mastercard', success: true },
    '2223003122003222': { brand: 'mastercard', success: true },
  };

  private static readonly CREDIT_PACKAGES = {
    small: { credits: 10, price: 9.99 },
    medium: { credits: 50, price: 39.99 },
    large: { credits: 100, price: 69.99 },
    enterprise: { credits: 500, price: 299.99 },
  };

  static generateTransactionId(): string {
    return `txn_${randomBytes(16).toString('hex')}`;
  }

  static generatePaymentIntentId(): string {
    return `pi_${randomBytes(16).toString('hex')}`;
  }

  static generateClientSecret(paymentIntentId: string): string {
    return `${paymentIntentId}_secret_${randomBytes(8).toString('hex')}`;
  }

  static createPaymentIntent(
    amount: number,
    credits: number,
    metadata?: Record<string, unknown>
  ): PaymentIntent {
    const id = this.generatePaymentIntentId();
    return {
      id,
      clientSecret: this.generateClientSecret(id),
      amount,
      credits,
      status: 'requires_payment_method',
      metadata,
    };
  }

  static createTestPaymentMethod(
    type: 'card' | 'paypal' | 'bank_transfer',
    cardNumber?: string
  ): PaymentMethod {
    const id = `pm_${randomBytes(12).toString('hex')}`;

    switch (type) {
      case 'card': {
        const testCard = cardNumber ? this.TEST_CARDS[cardNumber] : undefined;
        return {
          id,
          type: 'card',
          card: {
            brand: testCard?.brand ?? 'visa',
            last4: cardNumber?.slice(-4) ?? '4242',
            exp_month: 12,
            exp_year: new Date().getFullYear() + 2,
          },
        };
      }
      case 'paypal':
        return {
          id,
          type: 'paypal',
          paypal: {
            email: 'test@example.com',
          },
        };
      case 'bank_transfer':
        return {
          id,
          type: 'bank_transfer',
        };
      default: {
        const exhaustiveCheck: never = type;
        throw new Error(`Unsupported payment method type: ${String(exhaustiveCheck)}`);
      }
    }
  }

  static async simulatePayment(
    paymentIntentId: string,
    paymentMethodId: string,
    cardNumber?: string
  ): Promise<PaymentResult> {
    // Simulate processing delay
    await new Promise<void>((resolve) => setTimeout(resolve, Math.random() * 2000 + 1000));

    const paymentIntent: PaymentIntent = {
      id: paymentIntentId,
      clientSecret: this.generateClientSecret(paymentIntentId),
      amount: 0, // This would be retrieved from storage in real implementation
      credits: 0, // This would be retrieved from storage in real implementation
      status: 'processing',
      paymentMethod: paymentMethodId,
    };

    // Simulate different outcomes based on test card numbers
    if (cardNumber && this.TEST_CARDS[cardNumber]) {
      const testCard = this.TEST_CARDS[cardNumber];
      if (testCard.success) {
        paymentIntent.status = 'succeeded';
        return { success: true, paymentIntent };
      } else {
        paymentIntent.status = 'canceled';
        return {
          success: false,
          paymentIntent,
          error: testCard.error ?? 'payment_failed',
        };
      }
    }

    // Default to success for other payment methods
    const shouldSucceed = Math.random() > 0.1; // 90% success rate
    if (shouldSucceed) {
      paymentIntent.status = 'succeeded';
      return { success: true, paymentIntent };
    } else {
      paymentIntent.status = 'canceled';
      return {
        success: false,
        paymentIntent,
        error: 'payment_failed',
      };
    }
  }

  static getCreditPackages() {
    return this.CREDIT_PACKAGES;
  }

  static calculateCreditsForAmount(amount: number): number {
    // Simple calculation: $1 = 1 credit, with bulk discounts
    if (amount >= 299.99) return 500; // Enterprise package
    if (amount >= 69.99) return 100; // Large package
    if (amount >= 39.99) return 50; // Medium package
    if (amount >= 9.99) return 10; // Small package

    // Default rate: $0.10 per credit
    return Math.floor(amount * 10);
  }

  static calculateAmountForCredits(credits: number): number {
    // Find the best package deal or calculate at default rate
    const packages = Object.values(this.CREDIT_PACKAGES);
    const bestPackage = packages
      .filter((pkg) => pkg.credits <= credits)
      .sort((a, b) => b.credits / b.price - a.credits / a.price)[0];

    if (bestPackage) {
      const remainingCredits = credits - bestPackage.credits;
      return bestPackage.price + remainingCredits * 0.1;
    }

    // Default rate: $0.10 per credit
    return credits * 0.1;
  }

  static async simulateWebhook(
    eventType: 'payment.succeeded' | 'payment.failed' | 'payment.pending',
    paymentIntentId: string
  ): Promise<{
    id: string;
    type: string;
    data: {
      object: PaymentIntent;
    };
  }> {
    // Simulate webhook delay
    await new Promise<void>((resolve) => setTimeout(resolve, Math.random() * 1000 + 500));

    const status =
      eventType === 'payment.succeeded'
        ? 'succeeded'
        : eventType === 'payment.failed'
          ? 'canceled'
          : 'processing';

    return {
      id: `evt_${randomBytes(12).toString('hex')}`,
      type: eventType,
      data: {
        object: {
          id: paymentIntentId,
          clientSecret: this.generateClientSecret(paymentIntentId),
          amount: 0, // Would be retrieved from storage
          credits: 0, // Would be retrieved from storage
          status,
        },
      },
    };
  }
}
