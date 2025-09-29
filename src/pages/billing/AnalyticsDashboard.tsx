import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { apiService } from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Users, 
  FileText,
  PieChart,
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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

interface InsuranceClaim {
  id: string;
  patient_name: string;
  doctor_name: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'paid';
  service_type: string;
  service_date: string;
  insurance_provider: string;
}

interface Invoice {
  id: string;
  patient_name: string;
  doctor_name: string;
  total_amount: number;
  status: string;
  service_date: string;
}

interface AnalyticsData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalClaims: number;
  totalInvoices: number;
  claimsByStatus: Record<string, number>;
  revenueByDoctor: Record<string, number>;
  revenueByService: Record<string, number>;
}

const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalClaims: 0,
    totalInvoices: 0,
    claimsByStatus: {},
    revenueByDoctor: {},
    revenueByService: {}
  });
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Fetch data from API
  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch insurance claims
      const claimsResponse = await apiService.getInsuranceClaims();
      const invoicesResponse = await apiService.getInvoices();

      if (claimsResponse.success && invoicesResponse.success) {
        const claimsData = claimsResponse.data || [];
        const invoicesData = invoicesResponse.data || [];

        setClaims(claimsData);
        setInvoices(invoicesData);

        // Calculate analytics
        const analytics = calculateAnalytics(claimsData, invoicesData);
        setAnalyticsData(analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (claimsData: InsuranceClaim[], invoicesData: Invoice[]): AnalyticsData => {
    // Calculate total revenue from claims and invoices
    const claimsRevenue = claimsData
      .filter(claim => claim.status === 'paid' || claim.status === 'approved')
      .reduce((sum, claim) => sum + Number(claim.amount), 0);

    const invoicesRevenue = invoicesData
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + Number(invoice.total_amount), 0);

    const totalRevenue = claimsRevenue + invoicesRevenue;
    
    // Estimate expenses (30% of revenue for this example)
    const totalExpenses = totalRevenue * 0.3;
    const netProfit = totalRevenue - totalExpenses;

    // Claims by status
    const claimsByStatus = claimsData.reduce((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Revenue by doctor
    const revenueByDoctor = claimsData.reduce((acc, claim) => {
      if (claim.status === 'paid' || claim.status === 'approved') {
        acc[claim.doctor_name] = (acc[claim.doctor_name] || 0) + Number(claim.amount);
      }
      return acc;
    }, {} as Record<string, number>);

    // Revenue by service
    const revenueByService = claimsData.reduce((acc, claim) => {
      if (claim.status === 'paid' || claim.status === 'approved') {
        acc[claim.service_type] = (acc[claim.service_type] || 0) + Number(claim.amount);
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      totalClaims: claimsData.length,
      totalInvoices: invoicesData.length,
      claimsByStatus,
      revenueByDoctor,
      revenueByService
    };
  };
  const getCurrentMetrics = () => {
    // Calculate growth metrics (for demo purposes, we'll show positive growth)
    const revenueGrowth = 8.5; // Could be calculated from historical data
    const profitGrowth = 12.3;
    
    return {
      currentRevenue: analyticsData.totalRevenue,
      currentProfit: analyticsData.netProfit,
      revenueGrowth,
      profitGrowth,
      totalClaims: analyticsData.totalClaims,
      totalInvoices: analyticsData.totalInvoices,
      totalExpenses: analyticsData.totalExpenses
    };
  };

  const metrics = getCurrentMetrics();

  // Convert revenue by doctor to commission format
  const doctorCommissions = Object.entries(analyticsData.revenueByDoctor).map(([doctorName, revenue]) => {
    const commissionRate = 75; // 75% commission rate
    const commissionEarned = revenue * (commissionRate / 100);
    const appointmentCount = claims.filter(claim => 
      claim.doctor_name === doctorName && (claim.status === 'paid' || claim.status === 'approved')
    ).length;
    
    return {
      doctorId: `DR-${doctorName.replace(/\s+/g, '').toUpperCase().slice(0, 6)}`,
      doctorName,
      totalAppointments: appointmentCount,
      totalRevenue: revenue,
      commissionRate,
      commissionEarned,
      specialization: 'General Practice' // Default, could be fetched from doctor data
    };
  }).slice(0, 5); // Show top 5 doctors

  // Convert revenue by service to service revenue format
  const serviceRevenue = Object.entries(analyticsData.revenueByService).map(([service, revenue]) => {
    const appointmentCount = claims.filter(claim => 
      claim.service_type === service && (claim.status === 'paid' || claim.status === 'approved')
    ).length;
    
    return {
      service,
      revenue,
      appointments: appointmentCount,
      avgPrice: appointmentCount > 0 ? revenue / appointmentCount : 0
    };
  }).slice(0, 5); // Show top 5 services

  // Prepare chart data
  const getRevenueChartData = () => {
    const doctorNames = Object.keys(analyticsData.revenueByDoctor).slice(0, 6);
    const revenues = doctorNames.map(name => analyticsData.revenueByDoctor[name]);

    return {
      labels: doctorNames.map(name => name.split(' ').slice(-1)[0]), // Last name only for space
      datasets: [
        {
          label: 'Revenue ($)',
          data: revenues,
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6',
            '#06B6D4'
          ],
          borderColor: [
            '#2563EB',
            '#059669',
            '#D97706',
            '#DC2626',
            '#7C3AED',
            '#0891B2'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getClaimsStatusChartData = () => {
    const statuses = Object.keys(analyticsData.claimsByStatus);
    const counts = Object.values(analyticsData.claimsByStatus);

    return {
      labels: statuses.map(status => status.charAt(0).toUpperCase() + status.slice(1)),
      datasets: [
        {
          data: counts,
          backgroundColor: [
            '#10B981', // paid - green
            '#3B82F6', // approved - blue
            '#F59E0B', // pending - yellow
            '#8B5CF6', // processing - purple
            '#EF4444', // rejected - red
          ],
          borderColor: [
            '#059669',
            '#2563EB',
            '#D97706',
            '#7C3AED',
            '#DC2626',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const getMonthlyTrendData = () => {
    // Generate sample monthly data based on current metrics
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentRevenue = analyticsData.totalRevenue;
    const monthlyData = months.map((_, index) => {
      const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
      return Math.round(currentRevenue * (0.7 + index * 0.05 + variation));
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Revenue',
          data: monthlyData,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Expenses',
          data: monthlyData.map(revenue => Math.round(revenue * 0.3)),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
  };

  const getServiceRevenueChartData = () => {
    const services = serviceRevenue.map(s => s.service);
    const revenues = serviceRevenue.map(s => s.revenue);

    return {
      labels: services,
      datasets: [
        {
          label: 'Revenue ($)',
          data: revenues,
          backgroundColor: '#10B981',
          borderColor: '#059669',
          borderWidth: 1,
        },
      ],
    };
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

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
          <Button variant="outline" onClick={fetchAnalyticsData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
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
          
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Loading analytics data...</p>
          </div>
        </div>
      ) : (
        <>
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
                <div className="text-sm font-medium text-gray-500">Total Claims</div>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.totalClaims}
                </div>
                <div className="text-sm text-gray-500">Insurance claims</div>
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
                <div className="text-sm font-medium text-gray-500">Total Invoices</div>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.totalInvoices}
                </div>
                <div className="text-sm text-gray-500">Generated invoices</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Revenue Trend</h2>
          
        </div>
        <div className="h-80">
          <Line data={getMonthlyTrendData()} options={chartOptions} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Doctor Chart */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Revenue by Doctor</h2>
            
          </div>
          <div className="h-80">
            <Bar data={getRevenueChartData()} options={chartOptions} />
          </div>
        </Card>

        {/* Claims Status Distribution */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Claims Status Distribution</h2>
            
          </div>
          <div className="h-80">
            <Pie data={getClaimsStatusChartData()} options={pieChartOptions} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctor Commission Breakdown */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Doctor Commissions</h2>
           
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

        {/* Service Revenue Chart */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Service Revenue</h2>
           
          </div>
          <div className="h-80">
            <Bar data={getServiceRevenueChartData()} options={chartOptions} />
          </div>
          
          {/* Service Details Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Appointments</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Price</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serviceRevenue.map((service, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{service.service}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">${service.revenue.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{service.appointments}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">${service.avgPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Claims Status Overview */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Claims Status Overview</h2>
         
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(analyticsData.claimsByStatus).map(([status, count]) => {
            const getStatusColor = (status: string) => {
              switch (status) {
                case 'paid': return 'bg-green-100 text-green-800';
                case 'approved': return 'bg-blue-100 text-blue-800';
                case 'pending': return 'bg-yellow-100 text-yellow-800';
                case 'processing': return 'bg-purple-100 text-purple-800';
                case 'rejected': return 'bg-red-100 text-red-800';
                default: return 'bg-gray-100 text-gray-800';
              }
            };

            return (
              <div key={status} className="bg-white border rounded-lg p-4 text-center">
                <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-500">Claims</div>
              </div>
            );
          })}
        </div>
      </Card>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
