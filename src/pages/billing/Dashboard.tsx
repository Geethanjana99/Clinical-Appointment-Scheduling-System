import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import GenerateInvoiceModal from '../../components/modals/GenerateInvoiceModal';
import ViewInvoiceModal from '../../components/modals/ViewInvoiceModal';
import { DollarSignIcon, FileTextIcon, ChevronRightIcon, TrendingUpIcon, CalendarIcon, UserIcon } from 'lucide-react';
const BillingDashboard = () => {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [selectedInvoice, setSelectedInvoice] = React.useState<any>(null);

  // Mock invoice data for demonstration - using state to allow updates
  const [invoices, setInvoices] = React.useState([
    {
      id: 1,
      invoiceNumber: 'INV-20231001',
      patientName: 'John Smith',
      patientId: 'P-1001',
      appointmentDate: '2023-10-10',
      dueDate: '2023-10-25',
      generatedDate: '2023-10-11',
      status: 'paid' as const,
      totalAmount: 150,
      items: [
        {
          id: '1',
          description: 'General Consultation',
          quantity: 1,
          rate: 150,
          amount: 150
        }
      ],
      notes: 'Regular checkup appointment'
    },
    {
      id: 2,
      invoiceNumber: 'INV-20232001',
      patientName: 'John Smith',
      patientId: 'P-2001',
      appointmentDate: '2023-10-12',
      dueDate: '2023-10-27',
      generatedDate: '2023-10-12',
      status: 'unpaid' as const,
      totalAmount: 300,
      items: [
        {
          id: '1',
          description: 'Specialist Consultation',
          quantity: 1,
          rate: 250,
          amount: 250
        },
        {
          id: '2',
          description: 'Blood Test',
          quantity: 1,
          rate: 50,
          amount: 50
        }
      ],
      notes: 'Follow-up required'
    },    {
      id: 3,
      invoiceNumber: 'INV-20233001',
      patientName: 'John Smith',
      patientId: 'P-3001',
      appointmentDate: '2023-10-14',
      dueDate: '2023-10-29',
      generatedDate: '2023-10-14',
      status: 'unpaid' as const,
      totalAmount: 450,
      items: [
        {
          id: '1',
          description: 'X-Ray',
          quantity: 2,
          rate: 80,
          amount: 160
        },
        {
          id: '2',
          description: 'Emergency Visit',
          quantity: 1,
          rate: 290,
          amount: 290
        }
      ],
      notes: 'Emergency treatment completed'
    }
  ]);
  const handleGenerateInvoice = (invoiceData: any) => {
    console.log('Generated Invoice:', invoiceData);
    // Here you would typically send the data to your backend API
    // For now, we'll just log it and show a success message
    alert(`Invoice ${invoiceData.invoiceNumber} generated successfully for ${invoiceData.patientName}!`);
  };

  const handleViewInvoice = (index: number) => {
    setSelectedInvoice(invoices[index]);
    setIsViewModalOpen(true);
  };
  const handleRecordPaymentFromModal = (invoice: any) => {
    // Find the invoice index
    const index = invoices.findIndex(inv => inv.id === invoice.id);
    if (index !== -1) {
      handleRecordPayment(index);
    }
  };

  const handleRecordPayment = (index: number) => {
    const invoice = invoices[index];
    if (invoice.status === 'unpaid') {
      // Show confirmation dialog
      const confirmPayment = window.confirm(
        `Are you sure you want to record payment for Invoice ${invoice.invoiceNumber}?\nAmount: $${invoice.totalAmount.toFixed(2)}`
      );
      
      if (confirmPayment) {
        // Update the invoice status to paid
        setInvoices(prevInvoices => 
          prevInvoices.map((inv, i) => 
            i === index ? { ...inv, status: 'paid' as const } : inv
          )
        );
        
        // Show success message
        alert(`Payment recorded successfully for Invoice ${invoice.invoiceNumber}!`);
        
        // Update selected invoice if it's currently being viewed
        if (selectedInvoice && selectedInvoice.id === invoice.id) {
          setSelectedInvoice({ ...invoice, status: 'paid' });
        }
      }
    }
  };

  return <div className="space-y-6">      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Billing Dashboard</h1>
        <Button variant="primary" onClick={() => setIsInvoiceModalOpen(true)}>
          <FileTextIcon className="w-4 h-4 mr-2" />
          Generate Invoice
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 border border-blue-100">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Today's Revenue
              </p>
              <p className="text-2xl font-bold text-blue-800 mt-1">$2,854</p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                +12% from yesterday
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <DollarSignIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="bg-green-50 border border-green-100">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-green-600">
                Pending Payments
              </p>
              <p className="text-2xl font-bold text-green-800 mt-1">23</p>
              <p className="text-sm text-green-600 mt-1">$4,575 total</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <FileTextIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="bg-purple-50 border border-purple-100">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-purple-600">
                Completed Payments
              </p>
              <p className="text-2xl font-bold text-purple-800 mt-1">156</p>
              <p className="text-sm text-purple-600 mt-1">This month</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Invoices</h2>
          <Link to="/billing/invoices" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            View all <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice, index) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.patientName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {invoice.patientId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {invoice.invoiceNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${invoice.totalAmount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="outline" size="sm" className="mr-2" onClick={() => handleViewInvoice(index)}>
                      View
                    </Button>
                    {invoice.status === 'unpaid' && (
                      <Button variant="primary" size="sm" onClick={() => handleRecordPayment(index)}>
                        Record Payment
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody></table>
        </div>
      </Card>      {/* Generate Invoice Modal */}
      <GenerateInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onGenerate={handleGenerateInvoice}
      />      {/* View Invoice Modal */}
      <ViewInvoiceModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        invoiceData={selectedInvoice}
        onRecordPayment={handleRecordPaymentFromModal}
      />
    </div>;
};
export default BillingDashboard;