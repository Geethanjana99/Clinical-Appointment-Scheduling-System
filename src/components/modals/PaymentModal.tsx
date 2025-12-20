import { useState } from 'react';
import { X, CreditCard, Banknote, Wallet } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentConfirm: (paymentMethod: string, paymentStatus: string) => void;
  appointmentDetails: {
    doctorName: string;
    doctorSpecialty: string;
    appointmentDate: string;
    consultationFee: number;
    queueNumber?: string;
  };
}

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  onPaymentConfirm, 
  appointmentDetails 
}: PaymentModalProps) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  
  // Card form state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardHolder: ''
  });

  if (!isOpen) return null;

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    setShowCardForm(method === 'card');
  };

  const handlePayAtCounter = () => {
    onPaymentConfirm('counter', 'unpaid');
    onClose();
  };

  const handleOnlinePayment = async () => {
    if (!selectedPaymentMethod) {
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // For demo purposes, we'll simulate successful payment
      onPaymentConfirm(selectedPaymentMethod, 'paid');
      setIsProcessing(false);
      onClose();
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardInputChange = (field: string, value: string) => {
    if (field === 'cardNumber') {
      value = formatCardNumber(value);
    }
    setCardDetails(prev => ({ ...prev, [field]: value }));
  };

  const isCardFormValid = () => {
    return cardDetails.cardNumber.replace(/\s/g, '').length >= 16 &&
           cardDetails.expiryMonth &&
           cardDetails.expiryYear &&
           cardDetails.cvv.length >= 3 &&
           cardDetails.cardHolder.trim().length > 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Payment Options</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Close payment modal"
            aria-label="Close payment modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Appointment Summary */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Appointment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Doctor:</span>
              <span className="font-medium">{appointmentDetails.doctorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Specialty:</span>
              <span>{appointmentDetails.doctorSpecialty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span>{new Date(appointmentDetails.appointmentDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="text-blue-600">Regular</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-gray-900 font-medium">Consultation Fee:</span>
              <span className="text-lg font-bold text-green-600">
                ${appointmentDetails.consultationFee}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6">
          <h3 className="font-medium text-gray-900 mb-4">Choose Payment Method</h3>
          
          {/* Pay at Counter Option */}
          <div className="space-y-3 mb-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <div 
                className="p-4 flex items-center justify-between"
                onClick={handlePayAtCounter}
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Banknote className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Pay at Counter</h4>
                    <p className="text-sm text-gray-600">Pay when you visit the clinic</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Select
                </Button>
              </div>
            </Card>
          </div>

          {/* Online Payment Options */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-700 mb-3">Or Pay Now Online</h4>
            
            {/* Payment Method Selection */}
            <div className="space-y-3 mb-4">
              <div 
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedPaymentMethod === 'card' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handlePaymentMethodSelect('card')}
              >
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="font-medium">Credit/Debit Card</span>
                </div>
              </div>
              
              <div 
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedPaymentMethod === 'wallet' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handlePaymentMethodSelect('wallet')}
              >
                <div className="flex items-center">
                  <Wallet className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="font-medium">Digital Wallet</span>
                </div>
              </div>
            </div>

            {/* Card Form */}
            {showCardForm && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={cardDetails.cardNumber}
                    onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <select
                      value={cardDetails.expiryMonth}
                      onChange={(e) => handleCardInputChange('expiryMonth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      title="Expiry month"
                      aria-label="Card expiry month"
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <select
                      value={cardDetails.expiryYear}
                      onChange={(e) => handleCardInputChange('expiryYear', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      title="Expiry year"
                      aria-label="Card expiry year"
                    >
                      <option value="">YY</option>
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i} value={String(new Date().getFullYear() + i).slice(-2)}>
                          {String(new Date().getFullYear() + i).slice(-2)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      maxLength={4}
                      value={cardDetails.cvv}
                      onChange={(e) => handleCardInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardDetails.cardHolder}
                    onChange={(e) => handleCardInputChange('cardHolder', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Online Payment Button */}
            {selectedPaymentMethod && (
              <div className="mt-4">
                <Button
                  variant="primary"
                  onClick={handleOnlinePayment}
                  disabled={isProcessing || (showCardForm && !isCardFormValid())}
                  className="w-full"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    `Pay $${appointmentDetails.consultationFee} Now`
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-6 pb-6">
          <p className="text-xs text-gray-500 text-center">
            Your payment information is secure and encrypted. 
            You can also choose to pay at the counter when you visit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
