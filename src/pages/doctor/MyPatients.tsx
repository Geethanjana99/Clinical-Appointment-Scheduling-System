import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { Eye, Calendar, Clock, FileText, Activity } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastVisit: string;
  condition: string;
  status: 'active' | 'inactive';
  nextAppointment?: string;
  diabetesRisk?: 'low' | 'medium' | 'high';
  reports: number;
}

const MyPatients = () => {
  const navigate = useNavigate();
  const [patients] = useState<Patient[]>([
    {
      id: '1',
      name: 'John Smith',
      age: 45,
      gender: 'Male',
      lastVisit: '2024-01-15',
      condition: 'Diabetes Monitoring',
      status: 'active',
      nextAppointment: '2024-01-22',
      diabetesRisk: 'medium',
      reports: 3
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      age: 32,
      gender: 'Female',
      lastVisit: '2024-01-10',
      condition: 'Routine Checkup',
      status: 'active',
      diabetesRisk: 'low',
      reports: 2
    },
    {
      id: '3',
      name: 'Michael Brown',
      age: 58,
      gender: 'Male',
      lastVisit: '2024-01-08',
      condition: 'Hypertension',
      status: 'active',
      nextAppointment: '2024-01-25',
      diabetesRisk: 'high',
      reports: 5
    },
    {
      id: '4',
      name: 'Emily Davis',
      age: 28,
      gender: 'Female',
      lastVisit: '2023-12-20',
      condition: 'Annual Physical',
      status: 'inactive',
      diabetesRisk: 'low',
      reports: 1
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewPatient = (patientId: string) => {
    navigate(`/doctor/patient/${patientId}`);
  };

  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.status === 'active').length;
  const upcomingAppointments = patients.filter(p => p.nextAppointment).length;
  const highRiskPatients = patients.filter(p => p.diabetesRisk === 'high').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Patients
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalPatients}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Patients
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {activePatients}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Upcoming Appointments
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {upcomingAppointments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-red-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    High Risk Patients
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {highRiskPatients}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Patients Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Visit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Appointment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diabetes Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reports
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
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                      <div className="text-sm text-gray-500">{patient.age} years, {patient.gender}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.condition}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.lastVisit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.nextAppointment ? (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                        {patient.nextAppointment}
                      </div>
                    ) : (
                      <span className="text-gray-400">Not scheduled</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.diabetesRisk && (
                      <Badge className={getRiskColor(patient.diabetesRisk)}>
                        {patient.diabetesRisk} risk
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <FileText className="w-4 h-4 text-gray-400 mr-1" />
                      {patient.reports}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(patient.status)}>
                      {patient.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPatient(patient.id)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default MyPatients;
