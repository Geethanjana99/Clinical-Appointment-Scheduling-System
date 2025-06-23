import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { UsersIcon, UserPlusIcon, CalendarIcon, FileUpIcon, SearchIcon, PlusIcon } from 'lucide-react';
// Placeholder component for the Admin Dashboard
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuthStore();
  return <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage patients, doctors, appointments, and medical reports
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Quick Action Cards */}
        <Card className="bg-blue-50 border border-blue-100">
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-blue-100 rounded-full p-3 mb-3">
              <UserPlusIcon className="h-6 w-6 text-blue-600" />
            </div>            <h3 className="font-medium text-blue-800">Add New Patient</h3>
            <p className="text-sm text-blue-600 mt-1">Register a new patient</p>
            <Button variant="primary" size="sm" className="mt-3" onClick={() => navigate('/admin/patients')}>
              Add Patient
            </Button>
          </div>
        </Card>
        <Card className="bg-green-50 border border-green-100">
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-green-100 rounded-full p-3 mb-3">
              <UsersIcon className="h-6 w-6 text-green-600" />
            </div>            <h3 className="font-medium text-green-800">Add New Doctor</h3>
            <p className="text-sm text-green-600 mt-1">Register a new doctor</p>
            <Button variant="success" size="sm" className="mt-3" onClick={() => navigate('/admin/doctors')}>
              Add Doctor
            </Button>
          </div>
        </Card>
        <Card className="bg-purple-50 border border-purple-100">
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-purple-100 rounded-full p-3 mb-3">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-purple-800">
              Schedule Appointment
            </h3>            <p className="text-sm text-purple-600 mt-1">
              Create a new appointment
            </p>
            <Button variant="primary" size="sm" className="mt-3 bg-purple-600 hover:bg-purple-700 focus:ring-purple-500" onClick={() => navigate('/admin/appointments')}>
              Schedule
            </Button>
          </div>
        </Card>
        <Card className="bg-yellow-50 border border-yellow-100">
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-yellow-100 rounded-full p-3 mb-3">
              <FileUpIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="font-medium text-yellow-800">Upload Reports</h3>            <p className="text-sm text-yellow-600 mt-1">
              Upload patient reports
            </p>
            <Button variant="primary" size="sm" className="mt-3 bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500" onClick={() => navigate('/admin/reports')}>
              Upload
            </Button>
          </div>
        </Card>
      </div>
      {/* Patient Management Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Patient Management
          </h2>
          <div className="flex space-x-2">
            <div className="relative">
              <input type="text" placeholder="Search patients..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <SearchIcon className="h-5 w-5" />
              </div>            </div>
            <Button variant="primary" onClick={() => navigate('/admin/patients')}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Patient
            </Button>
          </div>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Added
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Sample data rows */}
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900">John Smith</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      john.smith@example.com
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">(555) 123-4567</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Oct 12, 2023</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="outline" size="sm" className="mr-2">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Delete
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900">Emily Davis</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      emily.davis@example.com
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">(555) 987-6543</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Oct 10, 2023</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="outline" size="sm" className="mr-2">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Delete
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      Michael Brown
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      michael.brown@example.com
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">(555) 456-7890</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Oct 8, 2023</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="outline" size="sm" className="mr-2">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Delete
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to{' '}
                  <span className="font-medium">3</span> of{' '}
                  <span className="font-medium">12</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button variant="outline" size="sm" className="rounded-l-md">
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="bg-blue-50 text-blue-600">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-r-md">
                    Next
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>;
};
export default AdminDashboard;