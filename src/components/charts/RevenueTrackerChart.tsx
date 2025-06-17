import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface RevenueData {
  month: string;
  revenue: number;
  target: number;
  expenses: number;
}

interface RevenueTracker {
  data?: RevenueData[];
}

const defaultData: RevenueData[] = [
  {
    month: 'Jan',
    revenue: 42000,
    target: 40000,
    expenses: 28000
  },
  {
    month: 'Feb',
    revenue: 38000,
    target: 42000,
    expenses: 29000
  },
  {
    month: 'Mar',
    revenue: 45000,
    target: 43000,
    expenses: 31000
  },
  {
    month: 'Apr',
    revenue: 48000,
    target: 45000,
    expenses: 32000
  },
  {
    month: 'May',
    revenue: 52000,
    target: 47000,
    expenses: 33000
  },
  {
    month: 'Jun',
    revenue: 55000,
    target: 50000,
    expenses: 35000
  }
];

const RevenueTrackerChart: React.FC<RevenueTracker> = ({
  data = defaultData
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            `$${value.toLocaleString()}`,
            name === 'revenue' ? 'Revenue' : name === 'target' ? 'Target' : 'Expenses'
          ]}
          contentStyle={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#10b981" 
          name="Actual Revenue"
          strokeWidth={3}
          dot={{ r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="target" 
          stroke="#3b82f6" 
          name="Target Revenue"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ r: 3 }}
        />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          stroke="#ef4444" 
          name="Expenses"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueTrackerChart;
