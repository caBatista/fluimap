'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Coins, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  savings?: string;
}

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

interface PaymentIntentResponse {
  paymentIntent: {
    id: string;
    clientSecret: string;
    amount: number;
    credits: number;
    status: string;
  };
}

interface ConfirmPaymentResponse {
  success: boolean;
  error?: string;
  creditsAdded?: number;
  newBalance?: number;
  paymentIntent?: {
    id: string;
    status: string;
  };
}

const creditPackages: CreditPackage[] = [
  {
    id: 'small',
    name: 'Pacote Inicial',
    credits: 10,
    price: 9.99,
  },
  {
    id: 'medium',
    name: 'Pacote Popular',
    credits: 50,
    price: 39.99,
    popular: true,
    savings: 'Economize 20%',
  },
  {
    id: 'large',
    name: 'Pacote Pro',
    credits: 100,
    price: 69.99,
    savings: 'Economize 30%',
  },
  {
    id: 'enterprise',
    name: 'Pacote Empresarial',
    credits: 500,
    price: 299.99,
    savings: 'Economize 40%',
  },
];

const testCards = [
  { number: '4242424242424242', label: 'Cartão de Sucesso (Visa)' },
  { number: '4000000000000002', label: 'Cartão Recusado (Visa)' },
  { number: '4000000000009995', label: 'Fundos Insuficientes (Visa)' },
  { number: '5555555555554444', label: 'Cartão de Sucesso (Mastercard)' },
];

export default function PaymentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedPackage, setSelectedPackage] = useState<string>('medium');
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPkg = creditPackages.find((pkg) => pkg.id === selectedPackage);

  const createPaymentMutation = useMutation({
    mutationFn: async ({
      amount,
      credits,
    }: {
      amount: number;
      credits: number;
    }): Promise<PaymentIntentResponse> => {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, credits, paymentMethod: 'card' }),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar intenção de pagamento');
      }

      return response.json() as Promise<PaymentIntentResponse>;
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async ({
      paymentIntentId,
      paymentMethodId,
      cardNumber,
      amount,
      credits,
    }: {
      paymentIntentId: string;
      paymentMethodId: string;
      cardNumber?: string;
      amount: number;
      credits: number;
    }): Promise<ConfirmPaymentResponse> => {
      const response = await fetch('/api/payments/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId, paymentMethodId, cardNumber, amount, credits }),
      });

      if (!response.ok) {
        throw new Error('Falha ao confirmar pagamento');
      }

      return response.json() as Promise<ConfirmPaymentResponse>;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          `Pagamento realizado com sucesso! ${data.creditsAdded} créditos adicionados à sua conta.`
        );
        void queryClient.invalidateQueries({ queryKey: ['credit-balance'] });
        router.push('/dashboard');
      } else {
        toast.error(`Falha no pagamento: ${data.error}`);
      }
      setIsProcessing(false);
    },
    onError: (error) => {
      toast.error(`Erro no pagamento: ${error.message}`);
      setIsProcessing(false);
    },
  });

  const handlePayment = async () => {
    if (!selectedPkg) return;

    setIsProcessing(true);

    try {
      const paymentIntentResult = await createPaymentMutation.mutateAsync({
        amount: selectedPkg.price,
        credits: selectedPkg.credits,
      });

      // Simulate payment method creation
      const paymentMethodId = `pm_${Math.random().toString(36).substr(2, 9)}`;

      // Confirm payment
      await confirmPaymentMutation.mutateAsync({
        paymentIntentId: paymentIntentResult.paymentIntent.id,
        paymentMethodId,
        cardNumber: paymentForm.cardNumber,
        amount: selectedPkg.price,
        credits: selectedPkg.credits,
      });
    } catch (err) {
      console.error(err);
      toast.error('Falha no pagamento. Tente novamente.');
      setIsProcessing(false);
    }
  };

  const handleTestCardSelect = (cardNumber: string) => {
    setPaymentForm((prev) => ({ ...prev, cardNumber }));
  };

  const isFormValid =
    paymentForm.cardNumber &&
    paymentForm.expiryDate &&
    paymentForm.cvv &&
    paymentForm.cardholderName;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">Comprar Créditos</h1>
        <p className="mt-2 text-muted-foreground">
          Escolha um pacote de créditos para continuar usando o FluiMap
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="mb-4 text-xl font-semibold">Selecione um Pacote</h2>
          <RadioGroup value={selectedPackage} onValueChange={setSelectedPackage}>
            {creditPackages.map((pkg) => (
              <div key={pkg.id} className="relative">
                <RadioGroupItem value={pkg.id} id={pkg.id} className="sr-only" />
                <Label
                  htmlFor={pkg.id}
                  className={`block cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                    selectedPackage === pkg.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`h-4 w-4 rounded-full border-2 ${
                          selectedPackage === pkg.id
                            ? 'border-primary bg-primary'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedPackage === pkg.id && (
                          <Check className="m-0.5 h-2 w-2 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{pkg.name}</h3>
                          {pkg.popular && <Badge variant="secondary">Mais Popular</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Coins className="h-4 w-4" />
                          {pkg.credits} créditos
                          {pkg.savings && (
                            <span className="font-medium text-green-600">• {pkg.savings}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">R${pkg.price}</div>
                      <div className="text-xs text-muted-foreground">
                        R${(pkg.price / pkg.credits).toFixed(2)}/crédito
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Detalhes do Pagamento
              </CardTitle>
              <CardDescription>
                Este é um pagamento simulado. Use os números de cartão de teste abaixo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardholderName">Nome do Portador do Cartão</Label>
                <Input
                  id="cardholderName"
                  placeholder="João Silva"
                  value={paymentForm.cardholderName}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      cardholderName: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Número do Cartão</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentForm.cardNumber}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      cardNumber: e.target.value.replace(/\s/g, ''),
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Data de Validade</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/AA"
                    value={paymentForm.expiryDate}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        expiryDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={paymentForm.cvv}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        cvv: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="my-4 h-px w-full bg-border" />

              <div className="space-y-2">
                <Label>Números de Cartão de Teste</Label>
                <div className="grid grid-cols-1 gap-2">
                  {testCards.map((card) => (
                    <Button
                      key={card.number}
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestCardSelect(card.number)}
                      className="justify-start text-xs"
                    >
                      {card.number} - {card.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPkg && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{selectedPkg.name}</span>
                    <span>{selectedPkg.credits} créditos</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>R${selectedPkg.price}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={handlePayment}
            disabled={!isFormValid || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? 'Processando...' : `Pagar R$${selectedPkg?.price ?? 0}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
