import React from 'react';
type StatusType = 'waiting' | 'in-progress' | 'completed' | 'cancelled' | 'pending' | 'approved' | 'rejected' | 'paid' | 'unpaid' | 'available' | 'busy' | 'offline';
interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}
const StatusBadge = ({
  status,
  className = ''
}: StatusBadgeProps) => {
  const getStatusClasses = () => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusLabel = () => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClasses()} ${className}`}>
      {getStatusLabel()}
    </span>;
};
export default StatusBadge;