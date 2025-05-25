import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { CalendarIcon, ClockIcon, UserIcon, ChevronRightIcon, CheckIcon, XIcon } from 'lucide-react';
// Mock data
const todayAppointments = [{
  id: 1,
  patient: 'John Smith',
  age: 45,
  time: '09:00 AM',
  reason: 'Annual checkup',
  status: 'waiting'
}, {
  id: 2,
  patient: 'Emily Johnson',
  age: 32,
  time: '10:30 AM',
  reason: 'Follow-up consultation',
  status: 'in-progress'
}, {
  id: 3,
  patient: 'Robert Williams',
  age: 58,
  time: '11:45 AM',
  reason: 'Chest pain',
  status: 'waiting'
}, {
  id: 4,
  patient: 'Sarah Davis',
  age: 29,
  time: '02:15 PM',
  reason: 'Migraine',
  status: 'waiting'
}];
const pendingPredictions = [{
  id: 1,
  patient: 'Michael Brown',
  type: 'Diabetes Risk Assessment',
  date: '2023-10-10',
  prediction: 'Medium Risk',
  status: 'pending'
}, {
  id: 2,
  patient: 'Jennifer Lee',
  type: 'Cardiovascular Risk Assessment',
  date: '2023-10-09',
  prediction: 'High Risk',
  status: 'pending'
}];
const DoctorDashboard = () => {
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Current Queue:</span>
          <StatusBadge status="in-progress" />
          <span className="font-medium">4 patients waiting</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Today's Appointments
            </h2>
            <Link to="/doctor/queue" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              Manage Queue <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayAppointments.map(appointment => <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patient}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.age} years
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {appointment.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {appointment.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={appointment.status as any} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Link to={`/doctor/patient/${appointment.id}`}>
                          <Button variant="secondary" size="sm">
                            View
                          </Button>
                        </Link>
                        {appointment.status === 'waiting' && <Button variant="primary" size="sm">
                            Start
                          </Button>}
                        {appointment.status === 'in-progress' && <Button variant="outline" size="sm">
                            Complete
                          </Button>}
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Queue Status</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {todayAppointments.filter(a => a.status === 'in-progress').length}
                </div>
                <span className="ml-3 font-medium">In Consultation</span>
              </div>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                  {todayAppointments.filter(a => a.status === 'waiting').length}
                </div>
                <span className="ml-3 font-medium">Waiting</span>
              </div>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <span className="ml-3 font-medium">Completed Today</span>
              </div>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Link to="/doctor/queue">
                <Button variant="primary" className="w-full">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Manage Queue
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Pending AI Predictions to Certify
          </h2>
        </div>
        {pendingPredictions.length > 0 ? <div className="space-y-4">
            {pendingPredictions.map(prediction => <div key={prediction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {prediction.patient}
                  </h3>
                  <p className="text-sm text-gray-700">{prediction.type}</p>
                  <div className="flex items-center mt-1">
                    <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {prediction.date}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <StatusBadge status={prediction.status as any} className="mb-2" />
                  <div className="text-sm font-medium text-gray-900">
                    {prediction.prediction}
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <XIcon className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button variant="primary" size="sm" className="flex items-center">
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Certify
                    </Button>
                  </div>
                </div>
              </div>)}
          </div> : <div className="text-center py-8">
            <p className="text-gray-500">No pending predictions to certify</p>
          </div>}
      </Card>
    </div>;
};
export default DoctorDashboard;