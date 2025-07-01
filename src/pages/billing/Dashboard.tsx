import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import GenerateInvoiceModal from '../../components/modals/GenerateInvoiceModal';
import ViewInvoiceModal from '../../components/modals/ViewInvoiceModal';
import { DollarSignIcon, FileTextIcon, ChevronRightIcon, TrendingUpIcon, CalendarIcon, UserIcon } from 'lucide-react';
import { apiService } from '../../services/api';

interface Invoice {
  id: string;
  invoice_number: string;
  patient_name: string;
  appointment_date: string;
  due_date: string;
  total_amount: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  notes: string;
  generated_date: string;
  created_at: string;
  updated_at: string;
}
const BillingDashboard = () => {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recent invoices from backend
  useEffect(() => {
    fetchRecentInvoices();
  }, []);

  const fetchRecentInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch only the 3 most recent invoices
      const response = await apiService.getInvoices({ limit: 3 });
      
      if (response.success && response.data) {
        setRecentInvoices(response.data);
      } else {
        setError('Failed to fetch recent invoices');
      }
    } catch (err) {
      console.error('Error fetching recent invoices:', err);
      setError('Error loading recent invoices');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusForBadge = (status: string): 'paid' | 'unpaid' | 'pending' | 'cancelled' => {
    switch (status) {
      case 'paid': return 'paid';
      case 'pending': return 'pending';
      case 'overdue': return 'unpaid';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  };  const handleGenerateInvoice = async (invoiceData: any) => {
    console.log('Generated Invoice:', invoiceData);
    
    // Show success message
    alert(`Invoice ${invoiceData.invoiceNumber} generated successfully for ${invoiceData.patientName}!`);
    
    // Refresh recent invoices to include the new one
    await fetchRecentInvoices();
  };
  const handleViewInvoice = (invoice: Invoice) => {
    // Convert the backend invoice to the format expected by ViewInvoiceModal
    const formattedInvoice = {
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      patientName: invoice.patient_name,
      appointmentDate: invoice.appointment_date,
      dueDate: invoice.due_date,
      generatedDate: invoice.generated_date,
      status: invoice.status,
      totalAmount: parseFloat(invoice.total_amount),
      notes: invoice.notes,
      items: [] // We would need to fetch invoice items separately
    };
    
    setSelectedInvoice(formattedInvoice);
    setIsViewModalOpen(true);
  };const handleRecordPaymentFromModal = async (invoice: any) => {
    // Show confirmation dialog
    const confirmPayment = window.confirm(
      `Are you sure you want to record payment for Invoice ${invoice.invoice_number || invoice.invoiceNumber}?\nAmount: ${formatCurrency(invoice.total_amount || invoice.totalAmount)}`
    );
    
    if (confirmPayment) {
      try {
        // Call the backend API to update the payment status
        const response = await apiService.updateInvoiceStatus(invoice.id, 'paid');
        
        if (response.success) {
          alert(`Payment recorded successfully for Invoice ${invoice.invoice_number || invoice.invoiceNumber}!`);
          // Refresh the recent invoices to show updated status
          await fetchRecentInvoices();
        } else {
          alert('Failed to record payment. Please try again.');
        }
      } catch (error) {
        console.error('Error recording payment:', error);
        alert('Error recording payment. Please try again.');
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-500">Loading recent invoices...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="text-red-600">
                      <p className="font-medium">Error Loading Invoices</p>
                      <p className="text-sm mt-1">{error}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={fetchRecentInvoices}
                      >
                        Try Again
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <p className="font-medium">No Recent Invoices</p>
                      <p className="text-sm mt-1">Create your first invoice to get started.</p>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => setIsInvoiceModalOpen(true)}
                      >
                        <FileTextIcon className="w-4 h-4 mr-2" />
                        Generate Invoice
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                recentInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.patient_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {invoice.appointment_date ? `Appointment: ${formatDate(invoice.appointment_date)}` : 'No appointment date'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {invoice.invoice_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        Generated: {formatDate(invoice.generated_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.total_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={getStatusForBadge(invoice.status)} />
                      <div className="text-xs text-gray-500 mt-1 capitalize">
                        {invoice.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mr-2" 
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        View
                      </Button>
                      {invoice.status === 'pending' && (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => handleRecordPaymentFromModal({ id: invoice.id, invoice_number: invoice.invoice_number, total_amount: invoice.total_amount })}
                        >
                          Record Payment
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
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