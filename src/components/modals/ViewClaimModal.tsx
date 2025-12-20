import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { X, FileText, User, DollarSign, Building, Stethoscope, Clock, CheckCircle, XCircle, AlertTriangle, Download, Printer } from 'lucide-react';

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
  notes?: string;
}

interface ViewClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: InsuranceClaim | null;
  onResubmit?: (claimId: string) => void;
}

const ViewClaimModal: React.FC<ViewClaimModalProps> = ({
  isOpen,
  onClose,
  claim,
  onResubmit
}) => {
  if (!claim) return null;

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
        return <Clock className="w-5 h-5" />;
      case 'processing':
        return <AlertTriangle className="w-5 h-5" />;
      case 'approved':
      case 'paid':
        return <CheckCircle className="w-5 h-5" />;
      case 'denied':
        return <XCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simple text representation of the claim
    const claimData = `
INSURANCE CLAIM DETAILS
=======================

Claim ID: ${claim.id}
Status: ${claim.status.toUpperCase()}
Claim Date: ${claim.claimDate}

PATIENT INFORMATION
-------------------
Name: ${claim.patientName}
Patient ID: ${claim.patientId}

SERVICE INFORMATION
-------------------
Doctor: ${claim.doctorName}
Service Type: ${claim.serviceType}
Service Date: ${claim.serviceDate}
Appointment ID: ${claim.appointmentId}

BILLING INFORMATION
-------------------
Claim Amount: $${claim.amount.toFixed(2)}
Insurance Provider: ${claim.insuranceProvider}
${claim.approvedAmount ? `Approved Amount: $${claim.approvedAmount.toFixed(2)}` : ''}
${claim.paidAmount ? `Paid Amount: $${claim.paidAmount.toFixed(2)}` : ''}

${claim.denialReason ? `DENIAL REASON\n--------------\n${claim.denialReason}` : ''}

${claim.notes ? `NOTES\n-----\n${claim.notes}` : ''}
    `;

    const blob = new Blob([claimData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `claim-${claim.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Insurance Claim Details</h3>
            <p className="text-sm text-gray-500">Claim ID: {claim.id}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="p-6">
        {/* Status Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getStatusIcon(claim.status)}
              <Badge variant={getStatusColor(claim.status)} className="ml-2 capitalize text-sm">
                {claim.status}
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              Submitted on {new Date(claim.claimDate).toLocaleDateString()}
            </div>
          </div>
          {claim.denialReason && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Denial Reason:</strong> {claim.denialReason}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patient Information */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-600" />
                Patient Information
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium text-gray-900">{claim.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Patient ID:</span>
                  <span className="text-sm font-medium text-gray-900">{claim.patientId}</span>
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Stethoscope className="w-4 h-4 mr-2 text-gray-600" />
                Service Information
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Doctor:</span>
                  <span className="text-sm font-medium text-gray-900">{claim.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Service Type:</span>
                  <span className="text-sm font-medium text-gray-900">{claim.serviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Service Date:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(claim.serviceDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Appointment ID:</span>
                  <span className="text-sm font-medium text-gray-900">{claim.appointmentId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-gray-600" />
                Billing Information
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Claim Amount:</span>
                  <span className="text-sm font-medium text-gray-900">${claim.amount.toFixed(2)}</span>
                </div>
                {claim.approvedAmount && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Approved Amount:</span>
                    <span className="text-sm font-medium text-green-600">${claim.approvedAmount.toFixed(2)}</span>
                  </div>
                )}
                {claim.paidAmount && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Paid Amount:</span>
                    <span className="text-sm font-medium text-green-600">${claim.paidAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Insurance Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Building className="w-4 h-4 mr-2 text-gray-600" />
                Insurance Information
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Provider:</span>
                  <span className="text-sm font-medium text-gray-900">{claim.insuranceProvider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Claim Date:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(claim.claimDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {claim.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Additional Notes</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{claim.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex items-center"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
          
          <div className="flex space-x-3">
            {claim.status === 'denied' && onResubmit && (
              <Button
                onClick={() => {
                  onResubmit(claim.id);
                  onClose();
                }}
                className="flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                Resubmit Claim
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewClaimModal;
