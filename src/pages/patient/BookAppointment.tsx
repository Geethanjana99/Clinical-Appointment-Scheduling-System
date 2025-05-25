import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { CalendarIcon } from 'lucide-react';
const BookAppointment = () => {
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
      </div>
      <Card>
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Book Your Appointment
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose your preferred doctor and time slot
          </p>
          <div className="mt-6">
            <Button variant="primary">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Schedule Now
            </Button>
          </div>
        </div>
      </Card>
    </div>;
};
export default BookAppointment;