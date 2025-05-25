import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { DollarSignIcon, FileTextIcon, ChevronRightIcon, TrendingUpIcon, CalendarIcon, UserIcon } from 'lucide-react';
const BillingDashboard = () => {
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Billing Dashboard</h1>
        <Button variant="primary">
          <FileTextIcon className="w-4 h-4 mr-2" />
          Generate Invoice
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 border border-blue-100">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Today's Revenue
              </p>
              <p className="text-2xl font-bold text-blue-800 mt-1">$2,854</p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                +12% from yesterday
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <DollarSignIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="bg-green-50 border border-green-100">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-green-600">
                Pending Payments
              </p>
              <p className="text-2xl font-bold text-green-800 mt-1">23</p>
              <p className="text-sm text-green-600 mt-1">$4,575 total</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <FileTextIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="bg-purple-50 border border-purple-100">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-purple-600">
                Completed Payments
              </p>
              <p className="text-2xl font-bold text-purple-800 mt-1">156</p>
              <p className="text-sm text-purple-600 mt-1">This month</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Invoices</h2>
          <Link to="/billing/invoices" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            View all <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3].map(index => <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          John Smith
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: P-{index}001
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      INV-2023{index}001
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${150 * index}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={index === 1 ? 'paid' : 'unpaid'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="outline" size="sm" className="mr-2">
                      View
                    </Button>
                    {index !== 1 && <Button variant="primary" size="sm">
                        Record Payment
                      </Button>}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </Card>
    </div>;
};
export default BillingDashboard;