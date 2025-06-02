import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

interface ResourceData {
  name: string;
  value: number;
  color: string;
}

interface ResourceAllocationChartProps {
  data?: ResourceData[];
}

const defaultData: ResourceData[] = [
  { name: 'Medical Staff', value: 45, color: '#3b82f6' },
  { name: 'Equipment', value: 25, color: '#10b981' },
  { name: 'Facilities', value: 15, color: '#f59e0b' },
  { name: 'Technology', value: 10, color: '#8b5cf6' },
  { name: 'Administration', value: 5, color: '#ef4444' }
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

const ResourceAllocationChart: React.FC<ResourceAllocationChartProps> = ({
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
          formatter={(value: number) => [`${value}%`, 'Allocation']}
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
              {value}: {entry?.payload?.value || 0}%
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ResourceAllocationChart;
