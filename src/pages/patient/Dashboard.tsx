import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { CalendarIcon, UploadIcon, ClockIcon, ActivityIcon, ChevronRightIcon } from 'lucide-react';
// Mock data
const upcomingAppointments = [{
  id: 1,
  doctor: 'Dr. Sarah Johnson',
  specialty: 'Cardiologist',
  date: '2023-10-15',
  time: '10:30 AM',
  status: 'waiting'
}, {
  id: 2,
  doctor: 'Dr. Michael Wong',
  specialty: 'Neurologist',
  date: '2023-10-22',
  time: '2:00 PM',
  status: 'waiting'
}];
const recentReports = [{
  id: 1,
  name: 'Blood Test Results',
  date: '2023-09-30',
  status: 'completed'
}, {
  id: 2,
  name: 'Urine Analysis',
  date: '2023-09-30',
  status: 'completed'
}, {
  id: 3,
  name: 'ECG Report',
  date: '2023-09-15',
  status: 'completed'
}];
const predictionResults = [{
  id: 1,
  name: 'Diabetes Risk Assessment',
  date: '2023-09-30',
  result: 'Low Risk',
  status: 'completed'
}];
const PatientDashboard = () => {
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
        <Link to="/patient/book-appointment">
          <Button variant="primary">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Upcoming Appointments
            </h2>
            <Link to="/patient/book-appointment" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              View all <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          {upcomingAppointments.length > 0 ? <div className="space-y-4">
              {upcomingAppointments.map(appointment => <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {appointment.doctor}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {appointment.specialty}
                    </p>
                    <div className="flex items-center mt-1 text-sm text-gray-700">
                      <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                      {appointment.date} at {appointment.time}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <StatusBadge status={appointment.status as any} />
                    <Link to={`/patient/queue`} className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                      Check queue
                    </Link>
                  </div>
                </div>)}
            </div> : <div className="text-center py-8">
              <p className="text-gray-500">No upcoming appointments</p>
              <Link to="/patient/book-appointment">
                <Button variant="outline" className="mt-4">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Book an Appointment
                </Button>
              </Link>
            </div>}
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <Link to="/patient/book-appointment">
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Book New Appointment
              </Button>
            </Link>
            <Link to="/patient/upload-reports">
              <Button variant="outline" className="w-full justify-start">
                <UploadIcon className="w-4 h-4 mr-2" />
                Upload Medical Reports
              </Button>
            </Link>
            <Link to="/patient/queue">
              <Button variant="outline" className="w-full justify-start">
                <ClockIcon className="w-4 h-4 mr-2" />
                Check Queue Status
              </Button>
            </Link>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Recent Medical Reports
            </h2>
            <Link to="/patient/upload-reports" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              Upload new <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          {recentReports.length > 0 ? <div className="space-y-3">
              {recentReports.map(report => <div key={report.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-500">{report.date}</p>
                  </div>
                  <Button variant="secondary" size="sm">
                    View
                  </Button>
                </div>)}
            </div> : <div className="text-center py-6">
              <p className="text-gray-500">No reports uploaded yet</p>
              <Link to="/patient/upload-reports">
                <Button variant="outline" className="mt-4">
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Upload Reports
                </Button>
              </Link>
            </div>}
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              AI Health Predictions
            </h2>
          </div>
          {predictionResults.length > 0 ? <div className="space-y-3">
              {predictionResults.map(prediction => <div key={prediction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {prediction.name}
                    </h3>
                    <div className="flex items-center mt-1">
                      <ActivityIcon className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {prediction.result}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{prediction.date}</p>
                  </div>
                  <Button variant="secondary" size="sm">
                    Details
                  </Button>
                </div>)}
            </div> : <div className="text-center py-6">
              <p className="text-gray-500">No AI predictions available</p>
              <p className="text-sm text-gray-400 mt-1">
                Upload your reports to get health predictions
              </p>
            </div>}
        </Card>
      </div>
    </div>;
};
export default PatientDashboard;