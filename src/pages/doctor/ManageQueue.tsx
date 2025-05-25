import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { useQueueStore } from '../../store/queueStore';
import { useAuthStore } from '../../store/authStore';
import { UserIcon, ClockIcon, CheckIcon } from 'lucide-react';
const ManageQueue = () => {
  const {
    user
  } = useAuthStore();
  const {
    queue,
    updateStatus
  } = useQueueStore();
  const doctorQueue = user ? queue.filter(item => item.doctorId === user.id) : [];
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Queue</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Current Queue:</span>
          <StatusBadge status="in-progress" />
          <span className="font-medium">{doctorQueue.length} patients</span>
        </div>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wait Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctorQueue.map(item => <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.patientName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.appointmentTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {item.estimatedWaitTime} mins
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.status === 'waiting' && <Button variant="primary" size="sm" onClick={() => updateStatus(item.id, 'in-consultation')}>
                        Start Consultation
                      </Button>}
                    {item.status === 'in-consultation' && <Button variant="outline" size="sm" onClick={() => updateStatus(item.id, 'completed')}>
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Complete
                      </Button>}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </Card>
    </div>;
};
export default ManageQueue;