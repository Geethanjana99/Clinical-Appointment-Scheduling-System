import React from 'react';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { ClockIcon } from 'lucide-react';
import { useQueueStore } from '../../store/queueStore';
import { useAuthStore } from '../../store/authStore';
const ViewQueue = () => {
  const {
    user
  } = useAuthStore();
  const {
    queue
  } = useQueueStore();
  const patientQueue = user ? queue.filter(item => item.patientId === user.id) : [];
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Queue Status</h1>
      </div>
      <Card>
        {patientQueue.length > 0 ? <div className="space-y-4">
            {patientQueue.map(item => <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {item.doctorName}
                  </h3>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {item.appointmentTime}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <StatusBadge status={item.status} />
                  {item.estimatedWaitTime > 0 && <span className="mt-2 text-sm text-gray-500">
                      Est. wait: {item.estimatedWaitTime} mins
                    </span>}
                </div>
              </div>)}
          </div> : <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No Active Queue
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any active appointments in the queue
            </p>
          </div>}
      </Card>
    </div>;
};
export default ViewQueue;