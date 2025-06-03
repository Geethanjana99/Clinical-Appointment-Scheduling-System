import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Users, 
  FileText,
  PieChart,
  BarChart3,
  Download
} from 'lucide-react';

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface DoctorCommission {
  doctorId: string;
  doctorName: string;
  totalAppointments: number;
  totalRevenue: number;
  commissionRate: number;
  commissionEarned: number;
  specialization: string;
}

interface ServiceRevenue {
  service: string;
  revenue: number;
  appointments: number;
  avgPrice: number;
}

const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  const [revenueData] = useState<RevenueData[]>([
    { month: 'Jan 2024', revenue: 45000, expenses: 25000, profit: 20000 },
    { month: 'Feb 2024', revenue: 52000, expenses: 27000, profit: 25000 },
    { month: 'Mar 2024', revenue: 48000, expenses: 26000, profit: 22000 },
    { month: 'Apr 2024', revenue: 55000, expenses: 28000, profit: 27000 },
    { month: 'May 2024', revenue: 58000, expenses: 29000, profit: 29000 },
    { month: 'Jun 2024', revenue: 62000, expenses: 30000, profit: 32000 }
  ]);

  const [doctorCommissions] = useState<DoctorCommission[]>([
    {
      doctorId: 'D001',
      doctorName: 'Dr. Sarah Johnson',
      totalAppointments: 85,
      totalRevenue: 21250,
      commissionRate: 25,
      commissionEarned: 5312.50,
      specialization: 'Cardiology'
    },
    {
      doctorId: 'D002',
      doctorName: 'Dr. Michael Chen',
      totalAppointments: 92,
      totalRevenue: 18400,
      commissionRate: 25,
      commissionEarned: 4600.00,
      specialization: 'Neurology'
    },
    {
      doctorId: 'D003',
      doctorName: 'Dr. Emily Davis',
      totalAppointments: 78,
      totalRevenue: 15600,
      commissionRate: 25,
      commissionEarned: 3900.00,
      specialization: 'General Medicine'
    }
  ]);

  const [serviceRevenue] = useState<ServiceRevenue[]>([
    { service: 'Consultation', revenue: 25000, appointments: 125, avgPrice: 200 },
    { service: 'Follow-up', revenue: 15000, appointments: 100, avgPrice: 150 },
    { service: 'Diagnostic Testing', revenue: 12000, appointments: 40, avgPrice: 300 },
    { service: 'Routine Checkup', revenue: 8000, appointments: 50, avgPrice: 160 },
    { service: 'Emergency Visit', revenue: 5000, appointments: 10, avgPrice: 500 }
  ]);

  const getCurrentMonthMetrics = () => {
    const currentMonth = revenueData[revenueData.length - 1];
    const previousMonth = revenueData[revenueData.length - 2];
    
    const revenueGrowth = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
    const profitGrowth = ((currentMonth.profit - previousMonth.profit) / previousMonth.profit) * 100;
    
    return {
      currentRevenue: currentMonth.revenue,
      currentProfit: currentMonth.profit,
      revenueGrowth,
      profitGrowth,
      totalAppointments: doctorCommissions.reduce((sum, doc) => sum + doc.totalAppointments, 0),
      totalCommissions: doctorCommissions.reduce((sum, doc) => sum + doc.commissionEarned, 0)
    };
  };

  const metrics = getCurrentMonthMetrics();

  const exportData = (type: string) => {
    alert(`Exporting ${type} data...`);
  };

  const generateReport = () => {
    alert('Generating comprehensive financial report...');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Financial Analytics Dashboard</h1>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="outline" onClick={generateReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Monthly Revenue</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${metrics.currentRevenue.toLocaleString()}
                </div>
                <div className="flex items-center mt-1">
                  {metrics.revenueGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(metrics.revenueGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Net Profit</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${metrics.currentProfit.toLocaleString()}
                </div>
                <div className="flex items-center mt-1">
                  {metrics.profitGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${metrics.profitGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(metrics.profitGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Total Appointments</div>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.totalAppointments}
                </div>
                <div className="text-sm text-gray-500">This month</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Doctor Commissions</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${metrics.totalCommissions.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total earned</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
          <Button variant="outline" size="sm" onClick={() => exportData('revenue')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Chart
          </Button>
        </div>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Revenue trend chart would be displayed here</p>
            <p className="text-sm text-gray-400">Integration with chart library required</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctor Commission Breakdown */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Doctor Commissions</h2>
            <Button variant="outline" size="sm" onClick={() => exportData('commissions')}>
              Export
            </Button>
          </div>
          <div className="space-y-4">
            {doctorCommissions.map((doctor) => (
              <div key={doctor.doctorId} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{doctor.doctorName}</h3>
                    <p className="text-sm text-gray-500">{doctor.specialization}</p>
                  </div>
                  <Badge variant="success">
                    {doctor.commissionRate}% rate
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Appointments:</span>
                    <span className="ml-2 font-medium">{doctor.totalAppointments}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Revenue:</span>
                    <span className="ml-2 font-medium">${doctor.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Commission Earned:</span>
                    <span className="font-semibold text-green-600">
                      ${doctor.commissionEarned.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Service Revenue Breakdown */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Service Revenue</h2>
            <Button variant="outline" size="sm" onClick={() => exportData('services')}>
              Export
            </Button>
          </div>
          <div className="space-y-4">
            {serviceRevenue.map((service, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{service.service}</h3>
                  <span className="text-lg font-semibold text-gray-900">
                    ${service.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <span>Appointments:</span>
                    <span className="ml-2 font-medium text-gray-900">{service.appointments}</span>
                  </div>
                  <div>
                    <span>Avg Price:</span>
                    <span className="ml-2 font-medium text-gray-900">${service.avgPrice}</span>
                  </div>
                </div>
                
                {/* Revenue bar */}
                <div className="mt-3">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(service.revenue / Math.max(...serviceRevenue.map(s => s.revenue))) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Monthly Performance Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Performance</h2>
          <Button variant="outline" size="sm" onClick={() => exportData('monthly')}>
            Export Table
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expenses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit Margin
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {revenueData.map((data, index) => {
                const profitMargin = ((data.profit / data.revenue) * 100).toFixed(1);
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {data.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${data.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${data.expenses.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${data.profit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={parseFloat(profitMargin) > 40 ? 'success' : parseFloat(profitMargin) > 30 ? 'warning' : 'danger'}>
                        {profitMargin}%
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
