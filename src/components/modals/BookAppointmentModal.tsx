import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { toast } from 'sonner';
interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
}
const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  patientId
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    notes: ''
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Appointment booked successfully!');
    setIsSubmitting(false);
    onClose();
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="Book Appointment">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Doctor
          </label>
          <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" value={formData.doctorId} onChange={e => setFormData({
          ...formData,
          doctorId: e.target.value
        })} required>
            <option value="">Select a doctor</option>
            <option value="1">Dr. Sarah Johnson - Cardiologist</option>
            <option value="2">Dr. Michael Wong - Neurologist</option>
            <option value="3">Dr. Emily Davis - Pediatrician</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input type="date" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" value={formData.date} onChange={e => setFormData({
          ...formData,
          date: e.target.value
        })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Time
          </label>
          <input type="time" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" value={formData.time} onChange={e => setFormData({
          ...formData,
          time: e.target.value
        })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" rows={3} value={formData.notes} onChange={e => setFormData({
          ...formData,
          notes: e.target.value
        })}></textarea>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            Book Appointment
          </Button>
        </div>
      </form>
    </Modal>;
};
export default BookAppointmentModal;