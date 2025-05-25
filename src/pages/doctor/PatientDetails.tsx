import React from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { UserIcon, FileTextIcon, HeartPulseIcon, ClipboardIcon } from 'lucide-react';
const PatientDetails = () => {
  const {
    id
  } = useParams();
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
        <Button variant="primary">
          <FileTextIcon className="w-4 h-4 mr-2" />
          Update Records
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="flex items-center space-x-4 p-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                John Smith
              </h2>
              <p className="text-sm text-gray-500">Patient ID: {id}</p>
              <p className="text-sm text-gray-500">Age: 45 years</p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-4">
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Blood Type</p>
                <p className="mt-1">A+</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Weight</p>
                <p className="mt-1">75 kg</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Height</p>
                <p className="mt-1">175 cm</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Visit</p>
                <p className="mt-1">Oct 1, 2023</p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="font-medium text-gray-900">Quick Actions</h3>
            <div className="mt-4 space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <ClipboardIcon className="w-4 h-4 mr-2" />
                View Medical History
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <HeartPulseIcon className="w-4 h-4 mr-2" />
                View Test Results
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileTextIcon className="w-4 h-4 mr-2" />
                Write Prescription
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>;
};
export default PatientDetails;