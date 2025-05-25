import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { BarChartIcon, PieChartIcon, CalendarIcon, UserIcon, DollarSignIcon, FileTextIcon, ChevronRightIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
// Mock data
const overviewStats = [{
  title: 'Total Appointments',
  value: '148',
  change: '+12%',
  isPositive: true
}, {
  title: 'Active Doctors',
  value: '12',
  change: '0%',
  isPositive: true
}, {
  title: 'Total Patients',
  value: '1,254',
  change: '+5%',
  isPositive: true
}, {
  title: 'Monthly Revenue',
  value: '$45,680',
  change: '+8%',
  isPositive: true
}];
const doctorPerformance = [{
  id: 1,
  name: 'Dr. Sarah Johnson',
  specialty: 'Cardiologist',
  patients: 42,
  rating: 4.8
}, {
  id: 2,
  name: 'Dr. Michael Wong',
  specialty: 'Neurologist',
  patients: 38,
  rating: 4.7
}, {
  id: 3,
  name: 'Dr. Emily Davis',
  specialty: 'Pediatrician',
  patients: 35,
  rating: 4.9
}, {
  id: 4,
  name: 'Dr. Robert Chen',
  specialty: 'Orthopedic',
  patients: 33,
  rating: 4.6
}];
const recentPayments = [{
  id: 1,
  patient: 'John Smith',
  amount: '$150',
  date: '2023-10-10',
  status: 'paid'
}, {
  id: 2,
  name: 'Emily Johnson',
  amount: '$250',
  date: '2023-10-09',
  status: 'paid'
}, {
  id: 3,
  name: 'Robert Williams',
  amount: '$350',
  date: '2023-10-08',
  status: 'unpaid'
}];
const ManagerDashboard = () => {
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <div className="flex space-x-3">
          <Button variant="outline">
            <FileTextIcon className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="primary">
            <CalendarIcon className="w-4 h-4 mr-2" />
            This Month
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">
                {stat.title}
              </h3>
              {index === 0 && <CalendarIcon className="w-5 h-5 text-blue-500" />}
              {index === 1 && <UserIcon className="w-5 h-5 text-blue-500" />}
              {index === 2 && <UsersIcon className="w-5 h-5 text-blue-500" />}
              {index === 3 && <DollarSignIcon className="w-5 h-5 text-blue-500" />}
            </div>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
              <div className={`ml-2 flex items-center text-sm ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.isPositive ? <TrendingUpIcon className="w-4 h-4 mr-1" /> : <TrendingDownIcon className="w-4 h-4 mr-1" />}
                {stat.change}
              </div>
            </div>
          </Card>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Appointment Statistics
            </h2>
            <div className="flex items-center">
              <Button variant="outline" size="sm" className="mr-2">
                Weekly
              </Button>
              <Button variant="primary" size="sm" className="mr-2">
                Monthly
              </Button>
              <Button variant="outline" size="sm">
                Yearly
              </Button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChartIcon className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="mt-2 text-sm text-gray-500">
                Monthly appointment statistics chart would appear here
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Revenue Distribution
            </h2>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <PieChartIcon className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="mt-2 text-sm text-gray-500">
                Revenue distribution chart would appear here
              </p>
            </div>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Doctor Performance
            </h2>
            <Link to="/manager/performance" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              View all <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialty
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patients
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctorPerformance.map(doctor => <tr key={doctor.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {doctor.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {doctor.specialty}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {doctor.patients}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-2">
                          {doctor.rating}
                        </span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => <svg key={i} className={`w-4 h-4 ${i < Math.floor(doctor.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>)}
                        </div>
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Recent Payments
            </h2>
            <Link to="/manager/reports" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              View all <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentPayments.map((payment, index) => <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {payment.patient}
                  </h3>
                  <div className="flex items-center mt-1">
                    <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {payment.date}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-lg font-semibold text-gray-900">
                    {payment.amount}
                  </div>
                  <StatusBadge status={payment.status as any} className="mt-1" />
                </div>
              </div>)}
            <div className="pt-4 border-t border-gray-200">
              <Link to="/manager/reports">
                <Button variant="outline" className="w-full">
                  <FileTextIcon className="w-4 h-4 mr-2" />
                  View Financial Reports
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>;
};
export default ManagerDashboard;