import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Sample health metric structure
interface HealthMetric {
  date: string; // e.g., "2025-05-01"
  bloodPressure: number; // e.g., 120
  sugarLevel: number; // e.g., 90
}

interface PatientHealthChartProps {
  patientName: string;
  patientId: string;
  data: HealthMetric[];
}

const PatientHealthChart: React.FC<PatientHealthChartProps> = ({
  patientName,
  patientId,
  data
}) => {
  return (
    <div className="w-full p-4 bg-white rounded-xl shadow-md">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{patientName}</h3>
        <p className="text-sm text-gray-500">Patient ID: {patientId}</p>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                borderRadius: '8px'
              }}
              formatter={(value, name) =>
                [value, name === 'bloodPressure' ? 'Blood Pressure' : 'Sugar Level']
              }
              labelFormatter={(label) =>
                `Date: ${new Date(label).toLocaleDateString()}`
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="bloodPressure"
              stroke="#ef4444"
              name="Blood Pressure"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="sugarLevel"
              stroke="#3b82f6"
              name="Sugar Level"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PatientHealthChart;
