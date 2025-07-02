import React from 'react';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import { 
  UsersIcon, 
  CalendarIcon, 
  ClipboardIcon, 
  HeartIcon,
  BellIcon,
  TrendingUpIcon
} from 'lucide-react';

const NurseDashboard = () => {
  const { user } = useAuthStore();

  const stats = [
    {
      title: 'Patients Today',
      value: '24',
      icon: UsersIcon,
      color: 'bg-blue-500',
      trend: '+12%'
    },
    {
      title: 'Scheduled Rounds',
      value: '8',
      icon: CalendarIcon,
      color: 'bg-green-500',
      trend: '+3%'
    },
    {
      title: 'Medications Due',
      value: '15',
      icon: ClipboardIcon,
      color: 'bg-yellow-500',
      trend: '-5%'
    },
    {
      title: 'Vitals Recorded',
      value: '42',
      icon: HeartIcon,
      color: 'bg-red-500',
      trend: '+18%'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      patient: 'Sarah Johnson',
      action: 'Vitals recorded',
      time: '10:30 AM',
      status: 'completed'
    },
    {
      id: 2,
      patient: 'Michael Chen',
      action: 'Medication administered',
      time: '10:15 AM',
      status: 'completed'
    },
    {
      id: 3,
      patient: 'Emma Davis',
      action: 'Post-op check pending',
      time: '11:00 AM',
      status: 'pending'
    },
    {
      id: 4,
      patient: 'David Wilson',
      action: 'Discharge preparation',
      time: '11:30 AM',
      status: 'in-progress'
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      task: 'Ward round with Dr. Smith',
      time: '2:00 PM',
      priority: 'high'
    },
    {
      id: 2,
      task: 'Patient education session',
      time: '3:30 PM',
      priority: 'medium'
    },
    {
      id: 3,
      task: 'Equipment inventory check',
      time: '4:00 PM',
      priority: 'low'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-600">
          Here's your nursing dashboard for today, {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <span className={`ml-2 text-sm flex items-center ${
                    stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUpIcon className="h-4 w-4 mr-1" />
                    {stat.trend}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{activity.patient}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{activity.time}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    activity.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : activity.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h3>
          <div className="space-y-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{task.task}</p>
                  <p className="text-sm text-gray-600">{task.time}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  task.priority === 'high' 
                    ? 'bg-red-100 text-red-800'
                    : task.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <HeartIcon className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-900">Record Vitals</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <ClipboardIcon className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-900">Medications</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
            <CalendarIcon className="h-8 w-8 text-yellow-600 mb-2" />
            <span className="text-sm font-medium text-yellow-900">Schedule</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <BellIcon className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-900">Alerts</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default NurseDashboard;
