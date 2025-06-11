'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Network } from 'vis-network/standalone/esm/vis-network';

type DashboardNetworkGraphProps = {
  surveyId?: string;
};

type NodeData = {
  Pessoa: string;
  Papel: string;
  Frequencia?: string | number;
  Direcao: string;
  Clareza: number;
  Objetividade: number;
  Efetividade: number;
  Comunicacao: string;
};

type EdgeData = {
  Pessoa: string;
  Pessoa2: string;
  Equipe: string;
  weight: number;
};

type DashboardResponse = {
  nodes: NodeData[];
  modelResults: {
    nodes: NodeData[];
    edges: EdgeData[];
  };
};

export function DashboardNetworkGraph({ surveyId }: DashboardNetworkGraphProps) {
  const [themeVersion, setThemeVersion] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!surveyId) return;

    function getForegroundColor() {
      if (typeof window === 'undefined') return '#222';
      const root = window.getComputedStyle(document.documentElement);
      const foreground = root.getPropertyValue('--foreground').trim();
      if (!foreground) return '#222';
      return `hsl(${foreground})`;
    }

    setLoading(true);
    setHasError(false);

    const fetchDataAndRenderGraph = async () => {
      try {
        const response = await fetch('/api/dashboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ surveyId }),
        });

        // Verifica se a resposta é válida e com conteúdo antes de parsear JSON
        if (!response.ok || response.headers.get('content-length') === '0') {
          setHasError(true);
          return;
        }

        const text = await response.text();

        if (!text) {
          setHasError(true);
          return;
        }

        const result = JSON.parse(text) as DashboardResponse;

        const rawNodes = Array.isArray(result.modelResults.nodes) ? result.modelResults.nodes : [];
        const rawEdges = Array.isArray(result.modelResults.edges) ? result.modelResults.edges : [];

        const uniqueNodesMap = new Map<string, NodeData>();
        rawNodes.forEach((n) => {
          if (!uniqueNodesMap.has(n.Pessoa)) {
            uniqueNodesMap.set(n.Pessoa, n);
          }
        });

        const uniqueNodes = Array.from(uniqueNodesMap.values());

        const idMap = new Map<string, number>();
        function getRandomColor() {
          const letters = '0123456789ABCDEF';
          let color = '#';
          for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
          }
          return color;
        }

        const nodes = uniqueNodes.map((n, index) => {
          const id = index + 1;
          idMap.set(n.Pessoa, id);
          return {
            id,
            label: n.Pessoa,
            group: n.Papel,
            color: getRandomColor(),
            font: { color: getForegroundColor() },
            title: `Frequência: ${n.Frequencia ?? 'N/A'}\nClareza: ${n.Clareza}\nObjetividade: ${n.Objetividade}\nEfetividade: ${n.Efetividade}\nComunicação: ${n.Comunicacao}`,
          };
        });

        const edges = rawEdges
          .map((e) => {
            const from = idMap.get(e.Pessoa);
            const to = idMap.get(e.Pessoa2);
            if (typeof from === 'number' && typeof to === 'number') {
              return {
                from,
                to,
                value: e.weight,
                title: `Equipe: ${e.Equipe}\nPeso: ${e.weight}`,
              };
            }
            return null;
          })
          .filter((e): e is NonNullable<typeof e> => e !== null);

        const data = { nodes, edges };

        if (!containerRef.current) return;

        if (networkRef.current) {
          networkRef.current.destroy();
        }

        const options = {
          nodes: {
            shape: 'dot',
            size: 20,
            font: {
              color: getForegroundColor(),
              size: 14,
            },
          },
          edges: {
            color: 'rgba(150, 150, 150, 0.5)',
            width: 2,
            scaling: {
              min: 1,
              max: 5,
            },
            smooth: true,
          },
          physics: {
            enabled: true,
            solver: 'forceAtlas2Based',
            stabilization: {
              enabled: true,
              iterations: 150,
              updateInterval: 25,
              onlyDynamicEdges: false,
              fit: true,
            },
          },
          interaction: {
            hover: true,
            tooltipDelay: 200,
          },
        };

        networkRef.current = new Network(containerRef.current, data, options);
        networkRef.current.stabilize();
      } catch (error) {
        console.error('Erro ao carregar os dados do dashboard:', error);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };

    void fetchDataAndRenderGraph();

    const html = document.documentElement;
    const observer = new MutationObserver(() => {
      setThemeVersion((v) => v + 1);
    });
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [surveyId, themeVersion]);

  return (
    <Card className="mt-6 rounded-2xl shadow-md">
      <CardContent className="p-4">
        <p className="mb-4 text-lg font-semibold">Conexões da Equipe</p>

        <div className="relative h-[400px] w-full">
          <div ref={containerRef} className="absolute inset-0" />

          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center text-gray-500">
              Carregando gráfico...
            </div>
          )}

          {hasError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center text-gray-500">
              Sem respostas da pesquisa até o momento.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
