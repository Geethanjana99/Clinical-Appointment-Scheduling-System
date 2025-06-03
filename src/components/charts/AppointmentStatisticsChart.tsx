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

interface AppointmentData {
  month: string;
  appointments: number;
  completed: number;
  cancelled: number;
}

interface AppointmentStatisticsChartProps {
  data?: AppointmentData[];
}

const defaultData: AppointmentData[] = [
  {
    month: 'Jan',
    appointments: 120,
    completed: 108,
    cancelled: 12
  },
  {
    month: 'Feb',
    appointments: 135,
    completed: 125,
    cancelled: 10
  },
  {
    month: 'Mar',
    appointments: 148,
    completed: 140,
    cancelled: 8
  },
  {
    month: 'Apr',
    appointments: 162,
    completed: 155,
    cancelled: 7
  },
  {
    month: 'May',
    appointments: 175,
    completed: 168,
    cancelled: 7
  },
  {
    month: 'Jun',
    appointments: 190,
    completed: 182,
    cancelled: 8
  }
];

const AppointmentStatisticsChart: React.FC<AppointmentStatisticsChartProps> = ({
  data = defaultData
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
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
        />
        <Legend />
        <Bar 
          dataKey="appointments" 
          name="Total Appointments"
          fill="#3b82f6" 
          radius={[2, 2, 0, 0]}
        />
        <Bar 
          dataKey="completed" 
          name="Completed"
          fill="#10b981" 
          radius={[2, 2, 0, 0]}
        />
        <Bar 
          dataKey="cancelled" 
          name="Cancelled"
          fill="#ef4444" 
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AppointmentStatisticsChart;
