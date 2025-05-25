import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useQueueStore } from '../../store/queueStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import {
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  FileTextIcon,
  HeartPulseIcon,
  CheckCircleIcon,
  DollarSignIcon,
  ClipboardIcon
} from 'lucide-react';
import PatientHealthChart from './PatientHealthChart'; // Adjust path accordingly

const DoctorDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { queue, getQueueForDoctor, updateStatus } = useQueueStore();

  const doctorQueue = user ? getQueueForDoctor(user.id) : [];

  const todayAppointments = [
    { id: 'appt-1', patientName: 'John Smith', patientId: 'patient-1', time: '09:00 AM', reason: 'Follow-up', status: 'waiting' },
    { id: 'appt-2', patientName: 'Emily Davis', patientId: 'patient-2', time: '09:30 AM', reason: 'Consultation', status: 'waiting' },
    { id: 'appt-3', patientName: 'Michael Brown', patientId: 'patient-3', time: '10:00 AM', reason: 'Check-up', status: 'in-consultation' },
    { id: 'appt-4', patientName: 'Jessica Wilson', patientId: 'patient-4', time: '10:30 AM', reason: 'Test Results', status: 'waiting' },
    { id: 'appt-5', patientName: 'David Miller', patientId: 'patient-5', time: '11:00 AM', reason: 'Follow-up', status: 'completed' }
  ];

  const pendingPredictions = [
    { id: 'pred-1', patientName: 'John Smith', patientId: 'patient-1', type: 'Diabetes Risk', result: 'Medium Risk', date: '2023-10-12', status: 'pending' },
    { id: 'pred-2', patientName: 'Emily Davis', patientId: 'patient-2', type: 'Heart Disease Risk', result: 'Low Risk', date: '2023-10-11', status: 'pending' }
  ];

  const currentPatient = todayAppointments.find(appt => appt.status === 'in-consultation');

  // Mock health chart data
  const healthChartData = [
    { date: '2024-05-01', bloodPressure: 120, sugarLevel: 90 },
    { date: '2024-05-08', bloodPressure: 125, sugarLevel: 100 },
    { date: '2024-05-15', bloodPressure: 130, sugarLevel: 110 },
    { date: '2024-05-22', bloodPressure: 118, sugarLevel: 95 }
  ];

  return (
    <div className="container mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Here's your schedule for today</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" icon={<CalendarIcon className="h-4 w-4" />}>Book Appointment</Button>
          <Button variant="outline" icon={<DollarSignIcon className="h-4 w-4" />}>Generate Invoice</Button>
          <Button variant="outline" icon={<ClipboardIcon className="h-4 w-4" />}>Insurance Claim</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Today's Appointments</p>
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
              <p className="text-sm font-medium text-green-600">Patients Seen</p>
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
              <p className="text-sm font-medium text-yellow-600">Pending Certifications</p>
              <p className="text-2xl font-bold text-yellow-800 mt-1">2</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <HeartPulseIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Current Patient Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card title="Current Patient" icon={<UsersIcon className="h-5 w-5" />}>
          {currentPatient ? (
            <div>
              <div className="mb-2">
                <p className="font-medium">{currentPatient.patientName}</p>
                <p className="text-sm text-gray-500">{currentPatient.reason}</p>
                <Badge variant="info" className="mt-1">In Consultation</Badge>
              </div>
              <div className="bg-blue-50 p-3 rounded-md mb-2">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Patient Notes</h4>
                <p className="text-sm text-gray-600">Regular diabetes monitoring. Previous visits show stable condition.</p>
              </div>
              <div className="flex space-x-2 mb-4">
                <Button variant="outline" size="sm" icon={<FileTextIcon className="h-4 w-4" />}>View Records</Button>
                <Button variant="primary" size="sm" icon={<CheckCircleIcon className="h-4 w-4" />} onClick={() => updateStatus(currentPatient.id, 'completed')}>Complete</Button>
              </div>
              {/* Health Chart */}
              <PatientHealthChart patientName={currentPatient.patientName} patientId={currentPatient.patientId} data={healthChartData} />
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No patient in consultation</p>
              <Button variant="outline" size="sm" className="mt-2" icon={<UsersIcon className="h-4 w-4" />}>Call Next Patient</Button>
            </div>
          )}
        </Card>

        {/* Today's Appointments */}
        <Card title="Today's Appointments" icon={<CalendarIcon className="h-5 w-5" />}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayAppointments.map(appointment => (
                  <tr key={appointment.id}>
                    <td className="px-4 py-3 whitespace-nowrap">{appointment.patientName}</td>
                    <td className="px-4 py-3">{appointment.time}</td>
                    <td className="px-4 py-3">{appointment.reason}</td>
                    <td className="px-4 py-3">
                      <Badge variant={appointment.status === 'waiting' ? 'warning' : appointment.status === 'in-consultation' ? 'info' : 'success'}>
                        {appointment.status.replace('-', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {appointment.status === 'waiting' && <Button size="sm" onClick={() => updateStatus(appointment.id, 'in-consultation')}>Start</Button>}
                      {appointment.status === 'in-consultation' && <Button size="sm" onClick={() => updateStatus(appointment.id, 'completed')}>Complete</Button>}
                      {appointment.status === 'completed' && <span className="text-sm text-gray-400">Done</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* AI Prediction Certifications */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pending AI Certifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingPredictions.map(prediction => (
            <Card key={prediction.id}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-medium">{prediction.patientName}</h3>
                  <p className="text-sm text-gray-500">{prediction.type}</p>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>
              <div className="text-sm">
                <div><strong>Result:</strong> {prediction.result}</div>
                <div className="text-xs text-gray-500">Generated: {prediction.date}</div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">View Details</Button>
                <Button variant="primary" size="sm" onClick={() => alert(`Certified prediction ${prediction.id}`)}>Certify</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
