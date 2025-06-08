import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import RevenueTrackerChart from '../../components/charts/RevenueTrackerChart';
import { DownloadIcon, CalendarIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
const BillingReports = () => {
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Billing Reports</h1>
        <div className="flex space-x-3">
          <Button variant="outline">
            <CalendarIcon className="w-4 h-4 mr-2" />
            This Month
          </Button>
          <Button variant="primary">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">
                Total Revenue
              </h3>
              <TrendingUpIcon className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 mt-2">$45,680</p>
            <p className="text-sm text-green-600 flex items-center mt-2">
              <TrendingUpIcon className="w-4 h-4 mr-1" />
              +8% from last month
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">
                Outstanding Amount
              </h3>
              <TrendingDownIcon className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 mt-2">$12,450</p>
            <p className="text-sm text-red-600 flex items-center mt-2">
              <TrendingDownIcon className="w-4 h-4 mr-1" />
              +12% from last month
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">
                Payment Success Rate
              </h3>
              <TrendingUpIcon className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 mt-2">85%</p>
            <p className="text-sm text-green-600 flex items-center mt-2">
              <TrendingUpIcon className="w-4 h-4 mr-1" />
              +2% from last month
            </p>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Revenue Trend
            </h2>
            <div className="h-64">
              <RevenueTrackerChart />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Payment Analysis
            </h2>
            <div className="space-y-4">
              {['Cash', 'Credit Card', 'Insurance', 'Other'].map(method => <div key={method} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{method}</h3>
                    <p className="text-sm text-gray-500">
                      {Math.floor(Math.random() * 100)} transactions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${Math.floor(Math.random() * 10000)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {Math.floor(Math.random() * 30)}% of total
                    </p>
                  </div>
                </div>)}
            </div>
          </div>
        </Card>
      </div>
    </div>;
};
export default BillingReports;