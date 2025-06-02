import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface DepartmentData {
  department: string;
  patients: number;
  satisfaction: number;
  efficiency: number;
}

interface DepartmentPerformanceChartProps {
  data?: DepartmentData[];
}

const defaultData: DepartmentData[] = [
  {
    department: 'Cardiology',
    patients: 150,
    satisfaction: 4.8,
    efficiency: 92
  },
  {
    department: 'Neurology',
    patients: 120,
    satisfaction: 4.6,
    efficiency: 88
  },
  {
    department: 'Pediatrics',
    patients: 200,
    satisfaction: 4.9,
    efficiency: 95
  },
  {
    department: 'Orthopedics',
    patients: 180,
    satisfaction: 4.5,
    efficiency: 85
  },
  {
    department: 'General Medicine',
    patients: 250,
    satisfaction: 4.7,
    efficiency: 90
  },
  {
    department: 'Emergency',
    patients: 300,
    satisfaction: 4.3,
    efficiency: 82
  }
];

const DepartmentPerformanceChart: React.FC<DepartmentPerformanceChartProps> = ({
  data = defaultData
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data} 
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="department" 
          tick={{ fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}
          formatter={(value, name) => {
            if (name === 'satisfaction') {
              return [`${value}/5.0`, 'Satisfaction Rating'];
            }
            if (name === 'efficiency') {
              return [`${value}%`, 'Efficiency'];
            }
            return [value, 'Patients Served'];
          }}
        />
        <Legend />
        <Bar 
          dataKey="patients" 
          name="Patients Served"
          fill="#3b82f6" 
          radius={[2, 2, 0, 0]}
        />
        <Bar 
          dataKey="efficiency" 
          name="Efficiency (%)"
          fill="#10b981" 
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DepartmentPerformanceChart;
