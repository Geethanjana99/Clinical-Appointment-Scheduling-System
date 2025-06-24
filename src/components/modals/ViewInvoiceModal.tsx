import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { FileTextIcon, DollarSignIcon, CalendarIcon, UserIcon, DownloadIcon, PrinterIcon } from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  patientName: string;
  patientId: string;
  appointmentDate: string;
  dueDate: string;
  generatedDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
  items: InvoiceItem[];
  totalAmount: number;
  notes?: string;
}

interface ViewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: InvoiceData | null;
  onRecordPayment?: (invoice: InvoiceData) => void;
}

const ViewInvoiceModal: React.FC<ViewInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoiceData,
  onRecordPayment
}) => {
  if (!invoiceData) return null;

  const handleRecordPaymentInModal = () => {
    if (invoiceData && invoiceData.status === 'unpaid' && onRecordPayment) {
      const confirmPayment = window.confirm(
        `Are you sure you want to record payment for Invoice ${invoiceData.invoiceNumber}?\nAmount: $${invoiceData.totalAmount.toFixed(2)}`
      );
      
      if (confirmPayment) {
        onRecordPayment(invoiceData);
        onClose(); // Close the modal after recording payment
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real application, this would generate and download a PDF
    alert('PDF download functionality would be implemented here');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unpaid':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-t-xl border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 rounded-full shadow-lg">
              <FileTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Invoice Details</h2>
              <p className="text-gray-600 text-sm">Invoice #{invoiceData.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleDownload} className="flex items-center">
              <DownloadIcon className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handlePrint} className="flex items-center">
              <PrinterIcon className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="p-8 space-y-8">
        {/* Invoice Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                Patient Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{invoiceData.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient ID:</span>
                  <span className="font-medium text-gray-900">{invoiceData.patientId}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-green-600" />
                Invoice Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Generated Date:</span>
                  <span className="font-medium text-gray-900">{new Date(invoiceData.generatedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Appointment Date:</span>
                  <span className="font-medium text-gray-900">{new Date(invoiceData.appointmentDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium text-gray-900">{new Date(invoiceData.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(invoiceData.status)}`}>
                    {invoiceData.status.charAt(0).toUpperCase() + invoiceData.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Services & Charges</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoiceData.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">${item.rate.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">${item.amount.toFixed(2)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Section */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end">
              <div className="text-right space-y-2">
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
                    <DollarSignIcon className="w-5 h-5 mr-1" />
                    <span className="text-xl font-bold">{invoiceData.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {invoiceData.notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
            <p className="text-gray-700">{invoiceData.notes}</p>
          </div>
        )}        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {invoiceData.status === 'unpaid' && (
            <Button variant="primary" className="bg-green-600 hover:bg-green-700" onClick={handleRecordPaymentInModal}>
              Record Payment
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewInvoiceModal;
