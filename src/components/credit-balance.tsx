'use client';

import { Coins, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface CreditBalance {
  credits: number;
  subscriptionTier: string;
  creditsExpirationDate?: string;
  lastCreditsPurchase?: string;
  totalCreditsEverPurchased: number;
}

const fetchCreditBalance = async (): Promise<CreditBalance> => {
  const response = await fetch('/api/credits/balance');

  if (!response.ok) {
    throw new Error('Failed to fetch credit balance');
  }

  const data = (await response.json()) as CreditBalance;
  return data;
};

export default function CreditBalance() {
  const router = useRouter();
  const {
    data: balance,
    isLoading: loading,
    error,
  } = useQuery<CreditBalance>({
    queryKey: ['credit-balance'],
    queryFn: fetchCreditBalance,
  });

  const handlePurchaseCredits = () => {
    router.push('/payment');
  };

  if (loading) {
    return (
      <Card className="mx-2 mb-4">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-yellow-500" />
            <span className="text-sm">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !balance) {
    return (
      <Card className="mx-2 mb-4">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-red-500" />
            <span className="text-sm text-red-500">Error loading credits</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-2 mb-4">
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins size={16} className="text-yellow-500" />
              <span className="text-sm font-medium">{balance.credits} créditos</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2"
              onClick={handlePurchaseCredits}
            >
              <Plus size={12} />
            </Button>
          </div>

          {balance.credits < 10 && (
            <div className="text-xs text-orange-500">
              ⚠️ Créditos baixos - Considere comprar mais
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
