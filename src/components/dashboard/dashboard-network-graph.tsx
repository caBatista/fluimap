"use client";

import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Network } from "vis-network/standalone/esm/vis-network";

export function DashboardNetworkGraph() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes = [
      { id: 1, label: "JD", group: "1" },
      { id: 2, label: "MT", group: "2" },
      { id: 3, label: "SM", group: "2" },
      { id: 4, label: "ER", group: "3" },
      { id: 5, label: "JK", group: "1" },
    ];

    const edges = [
      { from: 1, to: 3 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 5 },
      { from: 3, to: 4 },
      { from: 4, to: 5 },
    ];

    const data = { nodes, edges };

    const options = {
      nodes: {
        shape: "dot",
        size: 20,
        font: { color: "#fff" },
      },
      groups: {
        "1": { color: { background: "#1E90FF" } },
        "2": { color: { background: "#32CD32" } },
        "3": { color: { background: "#FF8C00" } },
      },      
      edges: {
        color: "rgba(150, 150, 150, 0.5)",
        width: 2,
      },
      physics: {
        stabilization: false,
      },
    };

    const network = new Network(containerRef.current, data, options);

    return () => network.destroy();
  }, []);

  return (
    <Card className="mt-6 shadow-md rounded-2xl">
      <CardContent className="p-4">
        <p className="text-lg font-semibold mb-4">Conexões da Equipe</p>
        <div ref={containerRef} className="h-[400px] w-full" />
      </CardContent>
    </Card>
  );
}
