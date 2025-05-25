import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useQueueStore } from '../../store/queueStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { CalendarIcon, UsersIcon, ClockIcon, FileTextIcon, HeartPulseIcon, CheckCircleIcon } from 'lucide-react';
const DoctorDashboard: React.FC = () => {
  const {
    user
  } = useAuthStore();
  const {
    queue,
    getQueueForDoctor,
    updateStatus
  } = useQueueStore();
  // Get queue for this doctor
  const doctorQueue = user ? getQueueForDoctor(user.id) : [];
  // Mock data for today's appointments
  const todayAppointments = [{
    id: 'appt-1',
    patientName: 'John Smith',
    patientId: 'patient-1',
    time: '09:00 AM',
    reason: 'Follow-up',
    status: 'waiting'
  }, {
    id: 'appt-2',
    patientName: 'Emily Davis',
    patientId: 'patient-2',
    time: '09:30 AM',
    reason: 'Consultation',
    status: 'waiting'
  }, {
    id: 'appt-3',
    patientName: 'Michael Brown',
    patientId: 'patient-3',
    time: '10:00 AM',
    reason: 'Check-up',
    status: 'in-consultation'
  }, {
    id: 'appt-4',
    patientName: 'Jessica Wilson',
    patientId: 'patient-4',
    time: '10:30 AM',
    reason: 'Test Results',
    status: 'waiting'
  }, {
    id: 'appt-5',
    patientName: 'David Miller',
    patientId: 'patient-5',
    time: '11:00 AM',
    reason: 'Follow-up',
    status: 'completed'
  }];
  // Mock AI predictions waiting for certification
  const pendingPredictions = [{
    id: 'pred-1',
    patientName: 'John Smith',
    patientId: 'patient-1',
    type: 'Diabetes Risk',
    result: 'Medium Risk',
    date: '2023-10-12',
    status: 'pending'
  }, {
    id: 'pred-2',
    patientName: 'Emily Davis',
    patientId: 'patient-2',
    type: 'Heart Disease Risk',
    result: 'Low Risk',
    date: '2023-10-11',
    status: 'pending'
  }];
  return <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">Here's your schedule for today</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <Card className="bg-blue-50 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Today's Appointments
              </p>
              <p className="text-2xl font-bold text-blue-800 mt-1">5</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="bg-green-50 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">
                Patients Seen
              </p>
              <p className="text-2xl font-bold text-green-800 mt-1">1</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <UsersIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="bg-yellow-50 border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">
                Pending Certifications
              </p>
              <p className="text-2xl font-bold text-yellow-800 mt-1">2</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <HeartPulseIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Current Patient */}
        <Card title="Current Patient" icon={<UsersIcon className="h-5 w-5" />} className="lg:col-span-1">
          {todayAppointments.find(appt => appt.status === 'in-consultation') ? <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <UsersIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="font-medium">Michael Brown</p>
                  <p className="text-sm text-gray-500">Check-up</p>
                </div>
                <Badge variant="info" className="ml-auto">
                  In Consultation
                </Badge>
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  Patient Notes
                </h4>
                <p className="text-sm text-gray-600">
                  Regular check-up for diabetes monitoring. Last visit was 3
                  months ago with stable blood sugar levels.
                </p>
              </div>
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" icon={<FileTextIcon className="h-4 w-4" />}>
                  View Records
                </Button>
                <Button variant="primary" size="sm" className="flex-1" icon={<CheckCircleIcon className="h-4 w-4" />} onClick={() => updateStatus('appt-3', 'completed')}>
                  Complete
                </Button>
              </div>
            </div> : <div className="text-center py-4">
              <p className="text-gray-500">No patient in consultation</p>
              <Button variant="outline" size="sm" className="mt-2" icon={<UsersIcon className="h-4 w-4" />}>
                Call Next Patient
              </Button>
            </div>}
        </Card>
        {/* Today's Appointments */}
        <Card title="Today's Appointments" icon={<CalendarIcon className="h-5 w-5" />} className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayAppointments.map(appointment => <tr key={appointment.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {appointment.patientName}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {appointment.time}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {appointment.reason}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {appointment.status === 'waiting' && <Badge variant="warning">Waiting</Badge>}
                      {appointment.status === 'in-consultation' && <Badge variant="info">In Consultation</Badge>}
                      {appointment.status === 'completed' && <Badge variant="success">Completed</Badge>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      {appointment.status === 'waiting' && <Button variant="outline" size="sm" onClick={() => updateStatus(appointment.id, 'in-consultation')}>
                          Start
                        </Button>}
                      {appointment.status === 'in-consultation' && <Button variant="outline" size="sm" onClick={() => updateStatus(appointment.id, 'completed')}>
                          Complete
                        </Button>}
                      {appointment.status === 'completed' && <Button variant="outline" size="sm" className="text-gray-400 cursor-not-allowed" disabled>
                          Completed
                        </Button>}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      {/* AI Predictions Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Pending AI Certifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingPredictions.map(prediction => <Card key={prediction.id} className="flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {prediction.patientName}
                  </h3>
                  <p className="text-sm text-gray-500">{prediction.type}</p>
                </div>
                <Badge variant="warning">Pending Certification</Badge>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">AI Prediction:</span>
                  <span className="text-sm font-bold text-blue-600">
                    {prediction.result}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Generated on {prediction.date}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1" icon={<FileTextIcon className="h-4 w-4" />}>
                  View Details
                </Button>
                <Button variant="primary" size="sm" className="flex-1" icon={<CheckCircleIcon className="h-4 w-4" />}>
                  Certify
                </Button>
              </div>
            </Card>)}
        </div>
      </div>
    </div>;
};
export default DoctorDashboard;