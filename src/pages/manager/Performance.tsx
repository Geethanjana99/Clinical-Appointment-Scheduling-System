import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { UserIcon, StarIcon, ClockIcon, TrendingUpIcon, BarChartIcon, CalendarIcon } from 'lucide-react';
const Performance = () => {
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Staff Performance</h1>
        <div className="flex space-x-3">
          <Button variant="outline">
            <CalendarIcon className="w-4 h-4 mr-2" />
            This Month
          </Button>
          <Button variant="primary">
            <BarChartIcon className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">
                Average Rating
              </h3>
              <StarIcon className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 mt-2">4.8/5.0</p>
            <p className="text-sm text-green-600 flex items-center mt-2">
              <TrendingUpIcon className="w-4 h-4 mr-1" />
              +0.3 from last month
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">
                Patient Satisfaction
              </h3>
              <UserIcon className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 mt-2">92%</p>
            <p className="text-sm text-green-600 flex items-center mt-2">
              <TrendingUpIcon className="w-4 h-4 mr-1" />
              +5% from last month
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">
                Avg. Wait Time
              </h3>
              <ClockIcon className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 mt-2">18 min</p>
            <p className="text-sm text-green-600 flex items-center mt-2">
              <TrendingUpIcon className="w-4 h-4 mr-1" />
              -3 min from last month
            </p>
          </div>
        </Card>
      </div>
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Staff Performance Overview
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patients Seen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map(index => <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            Dr. Sarah Johnson
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: D-{index}001
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Cardiology</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {120 - index * 10}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 mr-2">
                          {4 + Math.random().toFixed(1)}
                        </span>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-4 h-4" />)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{
                        width: `${95 - index * 5}%`
                      }}></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {95 - index * 5}%
                        </span>
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>;
};
export default Performance;