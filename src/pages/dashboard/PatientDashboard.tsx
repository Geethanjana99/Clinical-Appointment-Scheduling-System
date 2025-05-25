import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useQueueStore } from '../../store/queueStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { CalendarIcon, ClockIcon, UserIcon, FileTextIcon, HeartPulseIcon, ClipboardIcon, FileUpIcon } from 'lucide-react';
// Mock doctors data
const doctors = [{
  id: 'doctor-1',
  name: 'Dr. Sarah Johnson',
  specialty: 'Cardiologist',
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  availability: '9:00 AM - 5:00 PM',
  rating: 4.8
}, {
  id: 'doctor-2',
  name: 'Dr. Robert Chen',
  specialty: 'Endocrinologist',
  avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
  availability: '10:00 AM - 6:00 PM',
  rating: 4.7
}, {
  id: 'doctor-3',
  name: 'Dr. Emily Williams',
  specialty: 'General Physician',
  avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
  availability: '8:00 AM - 4:00 PM',
  rating: 4.9
}];
// Mock appointment data
const appointments = [{
  id: 'appt-123',
  doctorName: 'Dr. Sarah Johnson',
  doctorSpecialty: 'Cardiologist',
  date: '2023-10-15',
  time: '10:00 AM',
  status: 'upcoming'
}];
// Mock prediction data
const predictions = [{
  id: 'pred-1',
  type: 'Diabetes Risk',
  result: 'Low Risk',
  date: '2023-09-28',
  status: 'certified',
  details: 'Your blood glucose levels are within normal range.'
}];
const PatientDashboard: React.FC = () => {
  const {
    user
  } = useAuthStore();
  const {
    queue
  } = useQueueStore();
  // Filter queue for this patient
  const patientQueue = user ? queue.filter(item => item.patientId === user.id) : [];
  return <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">Your health dashboard</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointment Card */}
        <Card title="Your Next Appointment" icon={<CalendarIcon className="h-5 w-5" />} className="col-span-1">
          {appointments.length > 0 ? <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <UserIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">{appointments[0].doctorName}</p>
                    <p className="text-sm text-gray-500">
                      {appointments[0].doctorSpecialty}
                    </p>
                  </div>
                </div>
                <Badge variant="info">Upcoming</Badge>
              </div>
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm">{appointments[0].date}</span>
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm">{appointments[0].time}</span>
              </div>
              <div className="pt-2">
                <Button variant="outline" size="sm" className="mr-2">
                  Reschedule
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                  Cancel
                </Button>
              </div>
            </div> : <div className="text-center py-4">
              <p className="text-gray-500 mb-4">No upcoming appointments</p>
              <Button variant="primary" size="sm" icon={<CalendarIcon className="h-4 w-4" />}>
                Book Appointment
              </Button>
            </div>}
        </Card>
        {/* Queue Status Card */}
        <Card title="Queue Status" icon={<ClockIcon className="h-5 w-5" />} className="col-span-1">
          {patientQueue.length > 0 ? <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Current Status</p>
                  <div className="flex items-center mt-1">
                    {patientQueue[0].status === 'waiting' && <Badge variant="warning">In Waiting Room</Badge>}
                    {patientQueue[0].status === 'in-consultation' && <Badge variant="info">In Consultation</Badge>}
                    {patientQueue[0].status === 'completed' && <Badge variant="success">Completed</Badge>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Estimated Wait Time</p>
                  <p className="text-xl font-semibold text-blue-600">
                    {patientQueue[0].estimatedWaitTime} min
                  </p>
                </div>
              </div>
              <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-2 rounded-full" style={{
              width: patientQueue[0].status === 'waiting' ? '30%' : patientQueue[0].status === 'in-consultation' ? '70%' : '100%'
            }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Check-in</span>
                <span>Consultation</span>
                <span>Complete</span>
              </div>
            </div> : <div className="text-center py-4">
              <p className="text-gray-500">No active queue</p>
            </div>}
        </Card>
        {/* Health Predictions Card */}
        <Card title="AI Health Predictions" icon={<HeartPulseIcon className="h-5 w-5" />} className="col-span-1">
          {predictions.length > 0 ? <div className="space-y-4">
              {predictions.map(prediction => <div key={prediction.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{prediction.type}</span>
                    {prediction.status === 'certified' ? <Badge variant="success">Certified</Badge> : <Badge variant="warning">Pending</Badge>}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {prediction.result}
                  </p>
                  <p className="text-xs text-gray-500">
                    Analyzed on {prediction.date}
                  </p>
                </div>)}
              <div className="pt-2">
                <Button variant="outline" size="sm" fullWidth icon={<FileTextIcon className="h-4 w-4" />}>
                  View All Predictions
                </Button>
              </div>
            </div> : <div className="text-center py-4">
              <p className="text-gray-500 mb-4">No predictions available</p>
              <Button variant="primary" size="sm" icon={<FileUpIcon className="h-4 w-4" />}>
                Upload Reports
              </Button>
            </div>}
        </Card>
      </div>
      {/* Available Doctors Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Available Doctors
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(doctor => <Card key={doctor.id} className="flex flex-col">
              <div className="flex items-start space-x-4">
                <img src={doctor.avatar} alt={doctor.name} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                  <p className="text-sm text-gray-500">{doctor.specialty}</p>
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => <svg key={i} className={`h-4 w-4 ${i < Math.floor(doctor.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>)}
                    </div>
                    <span className="ml-1 text-sm text-gray-500">
                      {doctor.rating}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>Available: {doctor.availability}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                <Button variant="outline" size="sm" icon={<UserIcon className="h-4 w-4" />}>
                  View Profile
                </Button>
                <Button variant="primary" size="sm" icon={<CalendarIcon className="h-4 w-4" />}>
                  Book
                </Button>
              </div>
            </Card>)}
        </div>
      </div>
      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button fullWidth variant="outline" className="py-6" icon={<FileUpIcon className="h-5 w-5" />}>
          Upload Medical Reports
        </Button>
        <Button fullWidth variant="outline" className="py-6" icon={<ClipboardIcon className="h-5 w-5" />}>
          View Medical History
        </Button>
        <Button fullWidth variant="outline" className="py-6" icon={<HeartPulseIcon className="h-5 w-5" />}>
          Request Health Assessment
        </Button>
      </div>
    </div>;
};
export default PatientDashboard;