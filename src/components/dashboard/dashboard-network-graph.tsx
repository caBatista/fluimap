'use client';

import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Network } from 'vis-network/standalone/esm/vis-network';

export function DashboardNetworkGraph() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const rawNodes = [
      {
        Pessoa: 'JD',
        Papel: 'Líder',
        Frequencia: 5,
        Direcao: 'bidirecional',
        Clareza: 4,
        Objetividade: 5,
        Efetividade: 4,
        Comunicacao: 'Assertiva',
      },
      {
        Pessoa: 'MT',
        Papel: 'Dev',
        Frequencia: 3,
        Direcao: 'unidirecional',
        Clareza: 3,
        Objetividade: 3,
        Efetividade: 3,
        Comunicacao: 'Informal',
      },
      {
        Pessoa: 'SM',
        Papel: 'Dev',
        Frequencia: 4,
        Direcao: 'bidirecional',
        Clareza: 4,
        Objetividade: 4,
        Efetividade: 4,
        Comunicacao: 'Clara',
      },
      {
        Pessoa: 'ER',
        Papel: 'QA',
        Frequencia: 2,
        Direcao: 'unidirecional',
        Clareza: 2,
        Objetividade: 3,
        Efetividade: 2,
        Comunicacao: 'Burocrática',
      },
      {
        Pessoa: 'JK',
        Papel: 'PM',
        Frequencia: 5,
        Direcao: 'bidirecional',
        Clareza: 5,
        Objetividade: 5,
        Efetividade: 5,
        Comunicacao: 'Formal',
      },
    ];

    const rawEdges = [
      { Pessoa: 'JD', Pessoa2: 'SM', Equipe: 'A', weight: 3 },
      { Pessoa: 'JD', Pessoa2: 'MT', Equipe: 'A', weight: 4 },
      { Pessoa: 'MT', Pessoa2: 'SM', Equipe: 'A', weight: 2 },
      { Pessoa: 'SM', Pessoa2: 'JK', Equipe: 'A', weight: 3 },
      { Pessoa: 'SM', Pessoa2: 'ER', Equipe: 'A', weight: 1 },
      { Pessoa: 'ER', Pessoa2: 'JK', Equipe: 'A', weight: 2 },
    ];

    const nodes = rawNodes.map((n, index) => ({
      id: index + 1,
      label: n.Pessoa,
      group: n.Papel,
      title: `Frequência: ${n.Frequencia}\nClareza: ${n.Clareza}\nObjetividade: ${n.Objetividade}\nEfetividade: ${n.Efetividade}\nComunicação: ${n.Comunicacao}`,
    }));

    const idMap = new Map(rawNodes.map((n, i) => [n.Pessoa, i + 1]));

    const edges = rawEdges.map((e) => ({
      from: idMap.get(e.Pessoa),
      to: idMap.get(e.Pessoa2),
      value: e.weight,
      title: `Equipe: ${e.Equipe}\nPeso: ${e.weight}`,
    }));

    const data = { nodes, edges };

    const options = {
      nodes: {
        shape: 'dot',
        size: 20,
        font: { color: '#fff' },
      },
      groups: {
        Líder: { color: { background: '#1E90FF' } },
        Dev: { color: { background: '#32CD32' } },
        QA: { color: { background: '#FF8C00' } },
        PM: { color: { background: '#800080' } },
      },
      edges: {
        color: 'rgba(150, 150, 150, 0.5)',
        width: 2,
        scaling: {
          min: 1,
          max: 5,
        },
      },
      physics: {
        stabilization: false,
      },
    };

    const network = new Network(containerRef.current, data, options);

    return () => network.destroy();
  }, []);

  return (
    <Card className="mt-6 rounded-2xl shadow-md">
      <CardContent className="p-4">
        <p className="mb-4 text-lg font-semibold">Conexões da Equipe</p>
        <div ref={containerRef} className="h-[400px] w-full" />
      </CardContent>
    </Card>
  );
}
