import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DepartmentPerformanceChart from '../../components/charts/DepartmentPerformanceChart';
import ResourceAllocationChart from '../../components/charts/ResourceAllocationChart';
import { DownloadIcon, CalendarIcon, TrendingUpIcon, TrendingDownIcon, FileTextIcon } from 'lucide-react';
const ManagerReports = () => {
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Management Reports</h1>
        <div className="flex space-x-3">
          <Button variant="outline">
            <CalendarIcon className="w-4 h-4 mr-2" />
            This Month
          </Button>
          <Button variant="primary">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 border border-blue-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-blue-600">
                Operational Efficiency
              </h3>
            </div>
            <p className="text-2xl font-bold text-blue-800 mt-2">94%</p>
            <p className="text-sm text-blue-600 flex items-center mt-2">
              <TrendingUpIcon className="w-4 h-4 mr-1" />
              +2% from last month
            </p>
          </div>
        </Card>
        <Card className="bg-green-50 border border-green-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-green-600">
                Patient Satisfaction
              </h3>
            </div>
            <p className="text-2xl font-bold text-green-800 mt-2">4.8/5.0</p>
            <p className="text-sm text-green-600 flex items-center mt-2">
              <TrendingUpIcon className="w-4 h-4 mr-1" />
              +0.2 from last month
            </p>
          </div>
        </Card>
        <Card className="bg-purple-50 border border-purple-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-purple-600">
                Revenue Growth
              </h3>
            </div>
            <p className="text-2xl font-bold text-purple-800 mt-2">+15%</p>
            <p className="text-sm text-purple-600 flex items-center mt-2">
              <TrendingDownIcon className="w-4 h-4 mr-1" />
              -3% from last month
            </p>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Department Performance
            </h2>
            <div className="h-64">
              <DepartmentPerformanceChart />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Resource Allocation
            </h2>
            <div className="h-64">
              <ResourceAllocationChart />
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Available Reports
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Financial Summary', 'Staff Performance', 'Patient Statistics', 'Department Analytics', 'Resource Utilization', 'Quality Metrics'].map((report, index) => <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center">
                  <FileTextIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {report}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Last updated: Oct {index + 1}, 2023
                    </p>
                  </div>
                </div>
              </div>)}
          </div>
        </div>
      </Card>
    </div>;
};
export default ManagerReports;