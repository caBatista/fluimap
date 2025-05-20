import type { ReactNode } from 'react';

type Margin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

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
  <div
    style={{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
    }}
  >
    {children}
  </div>
);

export const BarChart = ({
  children,
  _data,
  _margin,
}: {
  children: ReactNode;
  _data?: unknown[];
  _margin?: Margin;
}) => <div className="mock-bar-chart">{children}</div>;

export const PieChart = ({ children }: { children: ReactNode }) => (
  <div className="mock-pie-chart">{children}</div>
);

export const Pie = ({
  children,
  _data,
  _cx,
  _cy,
  _labelLine,
  _outerRadius,
  _fill,
  _dataKey,
  _label,
}: {
  children?: ReactNode;
  _data?: unknown[];
  _cx?: string;
  _cy?: string;
  _labelLine?: boolean;
  _outerRadius?: number;
  _fill?: string;
  _dataKey?: string;
  _label?: (props: { name: string; percent: number }) => string;
}) => <div className="mock-pie">{children}</div>;

export const Cell = ({ fill }: { fill?: string }) => (
  <div className="mock-cell" style={{ backgroundColor: fill }}></div>
);

export const Legend = () => <div className="mock-legend"></div>;

export const Tooltip = () => <div className="mock-tooltip"></div>;

export const Bar = ({
  _dataKey,
  _fill,
  _name,
}: {
  _dataKey?: string;
  _fill?: string;
  _name?: string;
}) => <div className="mock-bar"></div>;

export const CartesianGrid = ({ _strokeDasharray }: { _strokeDasharray?: string }) => (
  <div className="mock-cartesian-grid"></div>
);

export const XAxis = ({ _dataKey }: { _dataKey?: string }) => <div className="mock-xaxis"></div>;

export const YAxis = () => <div className="mock-yaxis"></div>;
