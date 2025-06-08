import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

interface RevenueData {
  name: string;
  value: number;
  color: string;
}

interface RevenueDistributionChartProps {
  data?: RevenueData[];
}

const defaultData: RevenueData[] = [
  { name: 'Consultations', value: 18500, color: '#3b82f6' },
  { name: 'Procedures', value: 15200, color: '#10b981' },
  { name: 'Lab Tests', value: 8900, color: '#f59e0b' },
  { name: 'Medications', value: 3080, color: '#ef4444' }
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="500"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const RevenueDistributionChart: React.FC<RevenueDistributionChartProps> = ({
  data = defaultData
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
          contentStyle={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}
        />        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value, entry) => (
            <span style={{ color: entry?.color || '#000' }}>
              {value}: ${entry?.payload?.value?.toLocaleString() || '0'}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default RevenueDistributionChart;
