import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import GenerateInvoiceModal from '../../components/modals/GenerateInvoiceModal';
import ViewInvoiceModal from '../../components/modals/ViewInvoiceModal';
import { SearchIcon, FilterIcon, DownloadIcon, PlusIcon, UserIcon } from 'lucide-react';
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

const Invoices = () => {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch invoices from backend
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getInvoices(filters);
      
      if (response.success && response.data) {
        setInvoices(response.data);
      } else {
        setError('Failed to fetch invoices');
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Error loading invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  };  const handleGenerateInvoice = async (invoiceData: any) => {
    console.log('Generated Invoice:', invoiceData);
    
    // Show success message
    alert(`Invoice ${invoiceData.invoiceNumber} generated successfully for ${invoiceData.patientName}!`);
    
    // Refresh the invoices list to show the new invoice
    await fetchInvoices();
  };  const handleRecordPayment = async (invoice: Invoice) => {
    // Show confirmation dialog
    const confirmPayment = window.confirm(
      `Are you sure you want to record payment for Invoice ${invoice.invoice_number}?\nAmount: ${formatCurrency(invoice.total_amount)}`
    );
    
    if (confirmPayment) {
      try {
        // Call the backend API to update the payment status
        console.log('Updating invoice status for ID:', invoice.id);
        const response = await apiService.updateInvoiceStatus(invoice.id, 'paid');
        
        console.log('Update response:', response);
        
        if (response.success) {
          alert(`Payment recorded successfully for Invoice ${invoice.invoice_number}!`);
          // Refresh the invoices list to show updated status
          await fetchInvoices();
        } else {
          console.error('API returned success: false', response);
          alert(`Failed to record payment: ${response.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error recording payment:', error);
        const errorMessage = error instanceof Error ? error.message : 'Please try again.';
        alert(`Error recording payment: ${errorMessage}`);
      }
    }
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
  };

  const handleRecordPaymentFromModal = async (invoice: any) => {
    // Show confirmation dialog
    const confirmPayment = window.confirm(
      `Are you sure you want to record payment for Invoice ${invoice.invoiceNumber}?\nAmount: ${formatCurrency(invoice.totalAmount)}`
    );
    
    if (confirmPayment) {
      try {
        // Call the backend API to update the payment status
        console.log('Updating invoice status for ID:', invoice.id);
        const response = await apiService.updateInvoiceStatus(invoice.id, 'paid');
        
        console.log('Update response:', response);
        
        if (response.success) {
          alert(`Payment recorded successfully for Invoice ${invoice.invoiceNumber}!`);
          // Refresh the invoices list to show updated status
          await fetchInvoices();
          setIsViewModalOpen(false); // Close the modal
        } else {
          console.error('API returned success: false', response);
          alert(`Failed to record payment: ${response.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error recording payment:', error);
        const errorMessage = error instanceof Error ? error.message : 'Please try again.';
        alert(`Error recording payment: ${errorMessage}`);
      }
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    const filters = status ? { status } : undefined;
    fetchInvoices(filters);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filters = term ? { patient_name: term } : undefined;
    fetchInvoices(filters);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount);
  };
  const getStatusForBadge = (status: string): 'paid' | 'unpaid' | 'pending' | 'cancelled' => {
    switch (status) {
      case 'paid': return 'paid';
      case 'pending': return 'pending';
      case 'overdue': return 'unpaid';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  };
  return <div className="space-y-6">      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <Button variant="primary" onClick={() => setIsInvoiceModalOpen(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>
      <Card>        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Search by patient name..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <SearchIcon className="h-5 w-5" />
              </div>
            </div>
            <Button variant="outline">
              <FilterIcon className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <select 
              className="border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
            >
              <option value="">All Invoices</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Details
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
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-500">Loading invoices...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-red-600">
                      <p className="text-lg font-semibold">Error Loading Invoices</p>
                      <p className="text-sm mt-1">{error}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => fetchInvoices()}
                      >
                        Try Again
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <p className="text-lg font-semibold">No Invoices Found</p>
                      <p className="text-sm mt-1">Create your first invoice to get started.</p>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => setIsInvoiceModalOpen(true)}
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Create Invoice
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
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
                      <div className="text-sm text-gray-500">
                        Due: {formatDate(invoice.due_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.total_amount)}
                      </div>
                    </td>                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={getStatusForBadge(invoice.status)} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="outline" size="sm" className="mr-2">
                        <DownloadIcon className="w-4 h-4" />
                      </Button>                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mr-2"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        View
                      </Button>{invoice.status === 'pending' && (
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleRecordPayment(invoice)}
                        >
                          Record Payment
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">            <div className="text-sm text-gray-500">
              {loading ? 'Loading...' : `Showing ${invoices.length} invoice${invoices.length !== 1 ? 's' : ''}`}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div></div>
        </div>
      </Card>      {/* Generate Invoice Modal */}
      <GenerateInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onGenerate={handleGenerateInvoice}
      />

      {/* View Invoice Modal */}
      <ViewInvoiceModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        invoiceData={selectedInvoice}
        onRecordPayment={handleRecordPaymentFromModal}
      />
    </div>;
};
export default Invoices;