'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Coins, Dice1, Trophy, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface CreditBalance {
  credits: number;
  subscriptionTier: string;
  creditsExpirationDate?: string;
  lastCreditsPurchase?: string;
  totalCreditsEverPurchased: number;
}

interface BetResult {
  success: boolean;
  won: boolean;
  betAmount: number;
  winAmount?: number;
  newBalance: number;
  symbols: string[];
}

const SYMBOLS = ['🐅', '💎', '🍀', '🎰'];
const WINNING_COMBINATIONS = [
  ['🐅', '🐅', '🐅'], // Tiger - highest payout
  ['💎', '💎', '💎'], // Diamond - high payout
  ['🍀', '🍀', '🍀'], // Lucky - medium payout
  ['🎰', '🎰', '🎰'], // Slot - low payout
];

const PAYOUT_MULTIPLIERS: Record<string, number> = {
  '🐅': 10, // Tiger - 10x (highest)
  '💎': 5, // Diamond - 5x (high)
  '🍀': 3, // Lucky - 3x (medium)
  '🎰': 2, // Slot - 2x (low)
};

const fetchCreditBalance = async (): Promise<CreditBalance> => {
  const response = await fetch('/api/credits/balance');
  if (!response.ok) {
    throw new Error('Failed to fetch credit balance');
  }
  return response.json() as Promise<CreditBalance>;
};

const placeBet = async (betAmount: number): Promise<BetResult> => {
  const response = await fetch('/api/bet/place', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ betAmount }),
  });

  if (!response.ok) {
    const error = (await response.json()) as { error?: string };
    throw new Error(error.error ?? 'Failed to place bet');
  }

  return response.json() as Promise<BetResult>;
};

export default function BetPage() {
  const [betAmount, setBetAmount] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSymbols, setCurrentSymbols] = useState(['🎰', '🎰', '🎰']);
  const [lastResult, setLastResult] = useState<BetResult | null>(null);

  const queryClient = useQueryClient();

  const { data: balance, isLoading: balanceLoading } = useQuery<CreditBalance>({
    queryKey: ['credit-balance'],
    queryFn: fetchCreditBalance,
  });

  const betMutation = useMutation({
    mutationFn: placeBet,
    onSuccess: (result) => {
      setLastResult(result);
      setCurrentSymbols(result.symbols);

      if (result.won) {
        toast.success(`🎉 Você ganhou! +${result.winAmount} créditos!`);
      } else {
        toast.error(`😔 Você perdeu ${result.betAmount} créditos. Tente novamente!`);
      }

      // Refresh balance
      void queryClient.invalidateQueries({ queryKey: ['credit-balance'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setIsSpinning(false);
    },
  });

  const handleSpin = () => {
    if (!balance || balance.credits < betAmount) {
      toast.error('Créditos insuficientes!');
      return;
    }

    setIsSpinning(true);
    setLastResult(null);

    // Animate spinning
    const spinInterval = setInterval(() => {
      setCurrentSymbols([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] ?? '🎰',
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] ?? '🎰',
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] ?? '🎰',
      ]);
    }, 100);

    // Stop animation after 2 seconds and place bet
    setTimeout(() => {
      clearInterval(spinInterval);
      betMutation.mutate(betAmount);
    }, 2000);
  };

  const quickBetAmounts = [1, 5, 10, 25, 50];

  if (balanceLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Coins className="mx-auto mb-4 h-8 w-8 animate-spin text-yellow-500" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-3xl font-bold">🐅 Tigrinho</h1>
        <p className="text-muted-foreground">
          Aposte seus créditos e tente a sorte no jogo do tigre!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Game Area */}
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dice1 className="h-5 w-5" />
              Máquina do Tigre
            </CardTitle>
            <CardDescription>Combine 3 símbolos iguais para ganhar!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Slot Machine Display */}
            <div className="flex justify-center">
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-gradient-to-b from-yellow-400 to-orange-500 p-4">
                {currentSymbols.map((symbol, index) => (
                  <div
                    key={index}
                    className={`flex h-20 w-20 items-center justify-center rounded-lg bg-white text-4xl shadow-lg ${
                      isSpinning ? 'animate-pulse' : ''
                    }`}
                  >
                    {symbol}
                  </div>
                ))}
              </div>
            </div>

            {/* Last Result */}
            {lastResult && (
              <div className="text-center">
                {lastResult.won ? (
                  <Badge variant="default" className="bg-green-500 text-white">
                    <Trophy className="mr-1 h-4 w-4" />
                    Ganhou {lastResult.winAmount} créditos!
                  </Badge>
                ) : (
                  <Badge variant="destructive">Perdeu {lastResult.betAmount} créditos</Badge>
                )}
              </div>
            )}

            {/* Bet Controls */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="betAmount">Valor da Aposta</Label>
                <Input
                  id="betAmount"
                  type="number"
                  min={1}
                  max={balance?.credits ?? 0}
                  value={betAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setBetAmount(0);
                    } else {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue) && numValue >= 1) {
                        setBetAmount(numValue);
                      }
                    }
                  }}
                  className="mt-1"
                />
              </div>

              {/* Quick Bet Buttons */}
              <div className="flex flex-wrap gap-2">
                {quickBetAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(amount)}
                    disabled={!balance || balance.credits < amount}
                  >
                    {amount}
                  </Button>
                ))}
              </div>

              {/* Spin Button */}
              <Button
                onClick={handleSpin}
                disabled={isSpinning || !balance || balance.credits < betAmount}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                size="lg"
              >
                {isSpinning ? (
                  <>
                    <Zap className="mr-2 h-4 w-4 animate-spin" />
                    Girando...
                  </>
                ) : (
                  <>
                    <Dice1 className="mr-2 h-4 w-4" />
                    Girar ({betAmount} créditos)
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Panel */}
        <div className="space-y-6">
          {/* Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                Seus Créditos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{balance?.credits ?? 0}</div>
              <p className="text-sm text-muted-foreground">Créditos disponíveis para apostar</p>
            </CardContent>
          </Card>

          {/* Payout Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tabela de Pagamentos</CardTitle>
              <CardDescription>Multiplicadores para 3 símbolos iguais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(PAYOUT_MULTIPLIERS)
                  .sort(([, a], [, b]) => b - a)
                  .map(([symbol, multiplier]) => (
                    <div key={symbol} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{symbol}</span>
                        <span className="text-sm">x3</span>
                      </div>
                      <Badge variant="outline">{multiplier}x</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Game Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Como Jogar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Escolha o valor da sua aposta</p>
              <p>• Clique em &quot;Girar&quot; para jogar</p>
              <p>• Combine 3 símbolos iguais para ganhar</p>
              <p>• Quanto mais raro o símbolo, maior o prêmio!</p>
              <p>• O tigre 🐅 é o símbolo mais valioso</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
