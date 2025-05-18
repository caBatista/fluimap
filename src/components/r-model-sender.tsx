// retorna um array de dados vindos do modelo R
// classe temporaria (ou nao) para fins de validacao do dashboard

'use client';

import { useEffect, useState } from 'react';

type RModelSenderProps = {
  onData: (data: unknown) => void;
};

export default function RModelSender({ onData }: RModelSenderProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mensagem, setMensagem] = useState<string>('');

  useEffect(() => {
    const enviarParaModeloR = async () => {
      setStatus('loading');
      setMensagem('Enviando...');

      const mockInput = [
        // to do: remover dados mockados
        {
          Pessoa: 'Alice',
          Papel: 1,
          Frequencia: '2x sem',
          Direcao: 'Vertical',
          Clareza: 4,
          Objetividade: 4,
          Efetividade: 5,
          Comunicacao: 'Assíncrona',
          Equipe: 'Time A',
          Situacao: 'Trabalho',
        },
        {
          Pessoa: 'Bob',
          Papel: 2,
          Frequencia: '2x sem',
          Direcao: 'Horizontal',
          Clareza: 3,
          Objetividade: 3,
          Efetividade: 4,
          Comunicacao: 'Síncrona',
          Equipe: 'Time A',
          Situacao: 'Trabalho',
        },
        {
          Pessoa: 'Carol',
          Papel: 3,
          Frequencia: '1x dia',
          Direcao: 'Vertical',
          Clareza: 5,
          Objetividade: 5,
          Efetividade: 5,
          Comunicacao: 'Assíncrona',
          Equipe: 'Time A',
          Situacao: 'Trabalho',
        },
      ];

      try {
        const response = await fetch('/api/r-model', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockInput),
        });

        const data: unknown = await response.json();

        if (
          typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string'
        ) {
          setStatus('error');
          setMensagem(`Erro: ${(data as { error: string }).error}`);
          return;
        }
        setStatus('success');
        setMensagem('Dados recebidos com sucesso!');
        onData(data);
      } catch (err) {
        setStatus('error');
        setMensagem(`Erro inesperado: ${(err as Error).message}`);
      }
    };

    if (status === 'error') {
      // to do
    }

    void enviarParaModeloR();
  }, [onData, status]);

  return (
    <div className="p-4">
      <p className="text-sm text-gray-600">{mensagem}</p>
    </div>
  );
}
