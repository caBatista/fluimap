import React, { ReactNode } from 'react';

// Mock components for recharts
export const ResponsiveContainer = ({
  children,
  width,
  height,
}: {
  children: ReactNode;
  width: string | number;
  height: string | number;
}) => (
  <div style={{ width: typeof width === 'number' ? `${width}px` : width, height: typeof height === 'number' ? `${height}px` : height }}>
    {children}
  </div>
);

export const BarChart = ({
  data,
  children,
  margin,
}: {
  data?: any[];
  children: ReactNode;
  margin?: { top: number; right: number; bottom: number; left: number };
}) => <div className="mock-bar-chart">{children}</div>;

export const PieChart = ({ children }: { children: ReactNode }) => (
  <div className="mock-pie-chart">{children}</div>
);

export const Pie = ({
  data,
  cx,
  cy,
  labelLine,
  outerRadius,
  fill,
  dataKey,
  label,
  children,
}: {
  data?: any[];
  cx?: string | number;
  cy?: string | number;
  labelLine?: boolean;
  outerRadius?: number;
  fill?: string;
  dataKey?: string;
  label?: any;
  children?: ReactNode;
}) => <div className="mock-pie">{children}</div>;

export const Cell = ({
  key,
  fill,
}: {
  key?: string;
  fill?: string;
}) => <div className="mock-cell"></div>;

export const Legend = () => <div className="mock-legend"></div>;

export const Tooltip = () => <div className="mock-tooltip"></div>;

export const Bar = ({
  dataKey,
  fill,
  name,
}: {
  dataKey?: string;
  fill?: string;
  name?: string;
}) => <div className="mock-bar"></div>;

export const CartesianGrid = ({ strokeDasharray }: { strokeDasharray?: string }) => (
  <div className="mock-cartesian-grid"></div>
);

export const XAxis = ({ dataKey }: { dataKey?: string }) => (
  <div className="mock-xaxis"></div>
);

export const YAxis = () => <div className="mock-yaxis"></div>;