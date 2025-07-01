import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { UserIcon, DollarSignIcon, FileTextIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { apiService } from '../../services/api';

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

interface GenerateInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (invoiceData: any) => void;
}

const GenerateInvoiceModal: React.FC<GenerateInvoiceModalProps> = ({
    isOpen,
    onClose,
    onGenerate
}) => {    const [formData, setFormData] = useState({
        patientName: '',
        appointmentDate: '',
        dueDate: '',
        notes: ''
    });

    const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [items, setItems] = useState<InvoiceItem[]>([
        {
            id: '1',
            description: 'Consultation',
            quantity: 1,            rate: 150,
            amount: 150
        }
    ]);

    // Fetch patients from backend
    useEffect(() => {
        const fetchPatients = async () => {
            if (!isOpen) return; // Only fetch when modal is open
            
            setLoading(true);
            setError(null);            try {
                const response = await apiService.getPatientNames();
                
                if (response.success && response.data) {
                    const patientList = response.data.map((patient: any) => ({
                        id: patient.id,
                        name: patient.name || `${patient.first_name} ${patient.last_name}` || patient.email
                    }));
                    setPatients(patientList);
                } else {
                    // Fallback to sample data
                    const fallbackPatients = [
                        { id: 'P-001', name: 'John Smith' },
                        { id: 'P-002', name: 'Sarah Johnson' },
                        { id: 'P-003', name: 'Michael Brown' },
                        { id: 'P-004', name: 'Emily Davis' },
                        { id: 'P-005', name: 'David Wilson' }
                    ];
                    setPatients(fallbackPatients);
                    setError('Using sample patients - Please login as admin to view real data');
                }
            } catch (err) {
                console.error('Error fetching patients:', err);
                // Fallback to sample data
                const fallbackPatients = [
                    { id: 'P-001', name: 'John Smith' },
                    { id: 'P-002', name: 'Sarah Johnson' },
                    { id: 'P-003', name: 'Michael Brown' },
                    { id: 'P-004', name: 'Emily Davis' },
                    { id: 'P-005', name: 'David Wilson' }
                ];
                setPatients(fallbackPatients);
                setError('Using sample patients - Please check your connection and login');
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, [isOpen]);    const patientOptions = [
        { value: '', label: loading ? 'Loading patients...' : 'Select Patient' },
        ...patients.map(patient => ({
            value: patient.name,
            label: patient.name
        }))
    ];

    const serviceTemplates = [
        { description: 'General Consultation', rate: 150 },
        { description: 'Specialist Consultation', rate: 250 },
        { description: 'X-Ray', rate: 80 },
        { description: 'Blood Test', rate: 60 },
        { description: 'MRI Scan', rate: 500 },
        { description: 'Physical Therapy Session', rate: 120 },
        { description: 'Emergency Visit', rate: 300 }
    ];    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === 'quantity' || field === 'rate') {
                    updated.amount = updated.quantity * updated.rate;
                }
                return updated;
            }
            return item;
        }));
    };

    const addItem = () => {
        const newItem: InvoiceItem = {
            id: Date.now().toString(),
            description: '',
            quantity: 1,
            rate: 0,
            amount: 0
        };
        setItems(prev => [...prev, newItem]);
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(prev => prev.filter(item => item.id !== id));
        }
    };

    const addServiceTemplate = (template: any) => {
        const newItem: InvoiceItem = {
            id: Date.now().toString(),
            description: template.description,
            quantity: 1,
            rate: template.rate,
            amount: template.rate
        };
        setItems(prev => [...prev, newItem]);
    };

    const getTotalAmount = () => {
        return items.reduce((total, item) => total + item.amount, 0);
    };    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const invoiceData = {
            patientName: formData.patientName,
            appointmentDate: formData.appointmentDate,
            dueDate: formData.dueDate,
            notes: formData.notes,
            items,
            totalAmount: getTotalAmount(),
            invoiceNumber: `INV-${Date.now()}`
        };

        try {
            // Send invoice data to backend
            const response = await apiService.createInvoice(invoiceData);
            
            if (response.success) {
                // Call the original onGenerate callback with the full data including backend response
                onGenerate({
                    ...invoiceData,
                    generatedDate: new Date().toISOString().split('T')[0],
                    backendResponse: response.data
                });
                
                onClose();                // Reset form
                setFormData({
                    patientName: '',
                    appointmentDate: '',
                    dueDate: '',
                    notes: ''
                });
                setItems([{
                    id: '1',
                    description: 'Consultation',
                    quantity: 1,
                    rate: 150,
                    amount: 150
                }]);
            } else {
                setError('Failed to save invoice to database');
            }
        } catch (error) {
            console.error('Error saving invoice:', error);
            setError('Error saving invoice. Please try again.');
        }
    };return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-t-xl border-b">
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 p-3 rounded-full shadow-lg">
                        <FileTextIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Generate Invoice</h2>
                        <p className="text-gray-600 text-sm">Create a new invoice for patient services</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 p-6">
                {/* Patient Information Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">           
                         <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Select Patient
                        </label>                        <Select
                            value={formData.patientName}
                            onChange={(value) => handleInputChange('patientName', value)}
                            options={patientOptions}
                            required
                            disabled={loading}
                            className="transition-all duration-200 hover:border-blue-400 focus:border-blue-500 h-12 text-base"
                        />
                        {error && (
                            <p className="text-red-600 text-sm mt-1">{error}</p>
                        )}
                    </div><div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Appointment Date
                            </label>
                            <Input
                                type="date"
                                value={formData.appointmentDate}
                                onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                                required
                                className="transition-all duration-200 hover:border-blue-400 focus:border-blue-500 h-12 text-base"
                            />
                        </div>
                    </div>                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Due Date
                        </label>
                        <Input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => handleInputChange('dueDate', e.target.value)}
                            required
                            className="max-w-xs transition-all duration-200 hover:border-blue-400 focus:border-blue-500 h-12 text-base"
                        />
                    </div>
                </div>        {/* Quick Service Templates */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center mb-4">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <PlusIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Quick Add Services</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {serviceTemplates.map((template, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => addServiceTemplate(template)}
                                className="group bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-lg p-3 text-left transition-all duration-200 hover:shadow-md hover:scale-105"
                            >
                                <div className="text-sm font-medium text-blue-900 group-hover:text-blue-800">
                                    {template.description}
                                </div>
                                <div className="text-lg font-bold text-blue-700 mt-1">
                                    ${template.rate}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>        {/* Invoice Items Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                <FileTextIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Invoice Items</h3>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addItem}
                            className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-700 hover:from-green-100 hover:to-green-200 hover:border-green-300 transition-all duration-200"
                        >
                            <PlusIcon className="w-4 h-4 mr-1" />
                            Add Item
                        </Button>
                    </div>          <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                                <div className="grid grid-cols-12 gap-3 items-end">                                    <div className="col-span-12 sm:col-span-5">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                                        <Input
                                            placeholder="Service description..."
                                            value={item.description}
                                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                            required
                                            className="text-sm h-12"
                                        />
                                    </div>
                                    <div className="col-span-4 sm:col-span-2">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                                        <Input
                                            type="number"
                                            placeholder="1"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                            required
                                            className="text-sm text-center h-12"
                                        />
                                    </div>
                                    <div className="col-span-4 sm:col-span-2">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Rate ($)</label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            value={item.rate}
                                            onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                            required
                                            className="text-sm text-center h-12"
                                        />
                                    </div>
                                    <div className="col-span-3 sm:col-span-2">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                                        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm font-semibold px-3 py-3 rounded-md text-center h-12 flex items-center justify-center">
                                            ${item.amount.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="col-span-1 sm:col-span-1">
                                        {items.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeItem(item.id)}
                                                className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 transition-all duration-200 w-full sm:w-auto"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Enhanced Total Section */}
                    <div className="mt-6 pt-6 border-t-2 border-gray-200">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4 text-white">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-medium">Total Amount:</span>
                                <div className="flex items-center">
                                    <DollarSignIcon className="w-6 h-6 mr-2" />
                                    <span className="text-2xl font-bold">
                                        {getTotalAmount().toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>        {/* Notes Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center mb-4">
                        <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                            <FileTextIcon className="w-5 h-5 text-yellow-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Additional Notes</h3>
                    </div>

                    <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                        placeholder="Add any additional notes, payment terms, or special instructions..."
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 py-3 text-gray-700 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        <FileTextIcon className="w-5 h-5 mr-2" />
                        Generate Invoice
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default GenerateInvoiceModal;
