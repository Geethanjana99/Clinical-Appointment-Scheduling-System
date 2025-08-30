import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import CreateClaimModal from '../../components/modals/CreateClaimModal';
import ViewClaimModal from '../../components/modals/ViewClaimModal';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, Search, Filter, Plus } from 'lucide-react';

interface InsuranceClaim {
  id: string;
  patientName: string;
  patientId: string;
  appointmentId: string;
  doctorName: string;
  serviceDate: string;
  claimDate: string;
  amount: number;
  insuranceProvider: string;
  status: 'pending' | 'approved' | 'denied' | 'processing' | 'paid';
  denialReason?: string;
  approvedAmount?: number;
  paidAmount?: number;
  serviceType: string;
}

const InsuranceClaims = () => {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);

  React.useEffect(() => {
    // Fetch insurance claims from backend API
    fetch('/api/insurance-claims')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch claims');
        return res.json();
      })
      .then(data => {
        setClaims(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Error fetching insurance claims:', err);
      });
  }, []);

  const handleCreateClaim = (claimData: InsuranceClaim) => {
    setClaims(prevClaims => [claimData, ...prevClaims]);
    setIsCreateModalOpen(false);
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
      case 'denied':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <AlertTriangle className="w-4 h-4" />;
      case 'approved':
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'denied':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.insuranceProvider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getClaimSummary = () => {
    const totalClaims = claims.length;
    const totalAmount = claims.reduce((sum, claim) => sum + claim.amount, 0);
    const paidAmount = claims.filter(c => c.status === 'paid').reduce((sum, claim) => sum + (claim.paidAmount || 0), 0);
    const pendingAmount = claims.filter(c => c.status === 'pending' || c.status === 'processing').reduce((sum, claim) => sum + claim.amount, 0);
    
    return { totalClaims, totalAmount, paidAmount, pendingAmount };
  };

  const summary = getClaimSummary();
  const resubmitClaim = (claimId: string) => {
    setClaims(prevClaims => 
      prevClaims.map(claim => 
        claim.id === claimId 
          ? { 
              ...claim, 
              status: 'pending' as const, 
              claimDate: new Date().toISOString().split('T')[0],
              denialReason: undefined // Clear the denial reason
            }
          : claim
      )
    );
    // Show success message
    alert(`Claim ${claimId} has been resubmitted successfully. Status changed to Pending.`);
  };
  const viewClaimDetails = (claimId: string) => {
    const claim = claims.find(c => c.id === claimId);
    if (claim) {
      setSelectedClaim(claim);
      setIsViewModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Insurance Claims</h1>        <Button onClick={() => setIsCreateModalOpen(true)}>
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
              <option value="processing">Processing</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="denied">Denied</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Claims Table */}
      <Card>
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
                    <div className="text-sm font-medium text-gray-900">{claim.patientName}</div>
                    <div className="text-sm text-gray-500">ID: {claim.patientId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {claim.doctorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{claim.serviceType}</div>
                    <div className="text-sm text-gray-500">{claim.serviceDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {claim.insuranceProvider}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${claim.amount.toFixed(2)}</div>
                    {claim.approvedAmount && (
                      <div className="text-sm text-green-600">
                        Approved: ${claim.approvedAmount.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(claim.status)}
                      <Badge variant={getStatusColor(claim.status)} className="ml-2 capitalize">
                        {claim.status}
                      </Badge>
                    </div>
                    {claim.denialReason && (
                      <div className="text-xs text-red-600 mt-1">{claim.denialReason}</div>
                    )}
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
                      {claim.status === 'denied' && (
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
      </Card>      {filteredClaims.length === 0 && (
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

      {/* View Claim Modal */}
      <ViewClaimModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedClaim(null);
        }}
        claim={selectedClaim}
        onResubmit={resubmitClaim}
      />
    </div>
  );
};

export default InsuranceClaims;
