import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import CreateClaimModal from '../../components/modals/CreateClaimModal';
import { apiService } from '../../services/api';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, Search, Filter, Plus } from 'lucide-react';

interface InsuranceClaim {
  id: string;
  patient_name: string;
  doctor_name: string;
  service_date: string;
  claim_date: string;
  amount: number;
  insurance_provider: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'paid';
  service_type: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

const InsuranceClaims = () => {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchInsuranceClaims();
  }, []);

  const fetchInsuranceClaims = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInsuranceClaims();
      console.log('API Response:', response);
      if (response.success && response.data) {
        setClaims(response.data);
        console.log('Claims set:', response.data);
      } else {
        console.error('Failed to fetch claims:', response.error);
      }
    } catch (err) {
      console.error('Error fetching insurance claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClaim = (claimData: InsuranceClaim) => {
    console.log('New claim created:', claimData);
    setClaims(prevClaims => [claimData, ...prevClaims]);
    setIsCreateModalOpen(false);
    // Refresh the claims list to get the latest data
    fetchInsuranceClaims();
  };

  const viewClaimDetails = (claimId: string) => {
    // TODO: Implement view claim details modal
    console.log('View claim details for:', claimId);
    alert(`View details for claim ${claimId} - Feature coming soon!`);
  };

  const resubmitClaim = (claimId: string) => {
    // TODO: Implement resubmit functionality
    console.log('Resubmit claim:', claimId);
    alert(`Resubmit claim ${claimId} - Feature coming soon!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'approved':
        return 'success';
      case 'paid':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

    // Handle status change from pending to paid
  const handleMarkAsPaid = async (claimId: string) => {
    try {
      // Call the API to update the status to 'paid'
      const response = await apiService.updateInsuranceClaimStatus(claimId, 'paid');
      
      if (response.success) {
        // Update local state optimistically
        setClaims(prevClaims => 
          prevClaims.map(claim => 
            claim.id === claimId ? { ...claim, status: 'paid' } : claim
          )
        );
        console.log('Claim marked as paid successfully');
      } else {
        console.error('Failed to mark claim as paid:', response.error);
      }
      
    } catch (error) {
      console.error('Error marking claim as paid:', error);
      // Optionally show a user-friendly error message
    }
  };

  const getStatusIcon = (status: InsuranceClaim['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <AlertTriangle className="w-4 h-4" />;
      case 'approved':
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.insurance_provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getClaimSummary = () => {
    const totalClaims = claims.length;
    const totalAmount = claims.reduce((sum, claim) => sum + Number(claim.amount), 0);
    const paidAmount = claims.filter(c => c.status === 'paid').reduce((sum, claim) => sum + Number(claim.amount), 0);
    const pendingAmount = claims.filter(c => c.status === 'pending' || c.status === 'processing').reduce((sum, claim) => sum + Number(claim.amount), 0);
    
    return { totalClaims, totalAmount, paidAmount, pendingAmount };
  };

  const summary = getClaimSummary();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Insurance Claims</h1>        
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Claim
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Total Claims</div>
                <div className="text-2xl font-bold text-gray-900">{summary.totalClaims}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Paid Amount</div>
                <div className="text-2xl font-bold text-gray-900">${summary.paidAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Pending Amount</div>
                <div className="text-2xl font-bold text-gray-900">${summary.pendingAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Total Amount</div>
                <div className="text-2xl font-bold text-gray-900">${summary.totalAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search claims by patient, ID, or insurance provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              {/* <option value="processing">Processing</option>
              <option value="approved">Approved</option> */}
              <option value="paid">Paid</option>
              {/* <option value="rejected">Rejected</option> */}
            </select>
          </div>
        </div>
      </Card>

      {/* Claims Table */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading claims...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claim ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Insurance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
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
              {filteredClaims.map((claim) => (
                <tr key={claim.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {claim.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{claim.patient_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {claim.doctor_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{claim.service_type}</div>
                    <div className="text-sm text-gray-500">{new Date(claim.service_date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {claim.insurance_provider}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${Number(claim.amount).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(claim.status)}
                      <Badge variant={getStatusColor(claim.status)} className="ml-2 capitalize">
                        {claim.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewClaimDetails(claim.id)}
                      >
                        View
                      </Button>
                      {claim.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsPaid(claim.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Mark as Paid
                        </Button>
                      )}
                      {claim.status === 'rejected' && (
                        <Button
                          size="sm"
                          onClick={() => resubmitClaim(claim.id)}
                        >
                          Resubmit
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </Card>

      {!loading && filteredClaims.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No claims found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Insurance claims will appear here once submitted.'}
            </p>
          </div>
        </Card>
      )}      {/* Create Claim Modal */}
      <CreateClaimModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateClaim={handleCreateClaim}
      />
    </div>
  );
};

export default InsuranceClaims;
