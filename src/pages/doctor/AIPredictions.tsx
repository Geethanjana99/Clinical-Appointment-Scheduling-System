import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Eye, CheckCircle, XCircle, AlertTriangle, FileText, Clock } from 'lucide-react';

interface AIPrediction {
  id: string;
  patientId: string;
  patientName: string;
  reportType: 'blood' | 'urine' | 'other';
  diabetesRisk: 'low' | 'medium' | 'high';
  confidence: number;
  factors: string[];
  uploadDate: string;
  status: 'pending' | 'certified' | 'rejected';
  doctorNotes?: string;
  reportUrl?: string;
}

const AIPredictions = () => {
  const [predictions, setPredictions] = useState<AIPrediction[]>([
    {
      id: '1',
      patientId: 'p1',
      patientName: 'John Smith',
      reportType: 'blood',
      diabetesRisk: 'high',
      confidence: 85,
      factors: ['High glucose levels', 'HbA1c above normal', 'Family history'],
      uploadDate: '2024-01-15',
      status: 'pending'
    },
    {
      id: '2',
      patientId: 'p2',
      patientName: 'Sarah Johnson',
      reportType: 'urine',
      diabetesRisk: 'medium',
      confidence: 72,
      factors: ['Glucose present in urine', 'BMI above normal'],
      uploadDate: '2024-01-14',
      status: 'pending'
    },
    {
      id: '3',
      patientId: 'p3',
      patientName: 'Michael Brown',
      reportType: 'blood',
      diabetesRisk: 'low',
      confidence: 68,
      factors: ['Normal glucose levels', 'Regular exercise history'],
      uploadDate: '2024-01-12',
      status: 'certified',
      doctorNotes: 'Patient shows good glucose control. Continue current lifestyle.'
    }
  ]);

  const [selectedPrediction, setSelectedPrediction] = useState<AIPrediction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');

  const handleCertify = (predictionId: string) => {
    const prediction = predictions.find(p => p.id === predictionId);
    if (prediction) {
      setSelectedPrediction(prediction);
      setDoctorNotes('');
      setIsModalOpen(true);
    }
  };

  const handleSubmitCertification = (action: 'certified' | 'rejected') => {
    if (selectedPrediction) {
      setPredictions(prev => 
        prev.map(p => 
          p.id === selectedPrediction.id 
            ? { ...p, status: action, doctorNotes }
            : p
        )
      );
      setIsModalOpen(false);
      setSelectedPrediction(null);
      setDoctorNotes('');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'certified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingCount = predictions.filter(p => p.status === 'pending').length;
  const certifiedCount = predictions.filter(p => p.status === 'certified').length;
  const highRiskCount = predictions.filter(p => p.diabetesRisk === 'high').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">AI Diabetes Predictions</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Review
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {pendingCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Certified
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {certifiedCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    High Risk
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {highRiskCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Predictions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {predictions.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Predictions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key Factors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
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
              {predictions.map((prediction) => (
                <tr key={prediction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {prediction.patientName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className="bg-gray-100 text-gray-800 capitalize">
                      {prediction.reportType}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getRiskColor(prediction.diabetesRisk)}>
                      {prediction.diabetesRisk} risk
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${prediction.confidence}%` }}
                        ></div>
                      </div>
                      <span>{prediction.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      {prediction.factors.slice(0, 2).map((factor, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          • {factor}
                        </div>
                      ))}
                      {prediction.factors.length > 2 && (
                        <div className="text-xs text-gray-400">
                          +{prediction.factors.length - 2} more
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prediction.uploadDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(prediction.status)}>
                      {prediction.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {prediction.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleCertify(prediction.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Certify
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Certification Modal */}
      {isModalOpen && selectedPrediction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Certify AI Prediction
              </h3>
              
              <div className="mb-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900">Prediction Summary</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Patient: {selectedPrediction.patientName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Risk Level: <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(selectedPrediction.diabetesRisk)}`}>
                      {selectedPrediction.diabetesRisk}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Confidence: {selectedPrediction.confidence}%
                  </p>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">Key Factors:</p>
                    <ul className="text-sm text-gray-600 mt-1">
                      {selectedPrediction.factors.map((factor, index) => (
                        <li key={index}>• {factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinical Notes
                </label>
                <textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add your clinical assessment and recommendations..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSubmitCertification('rejected')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleSubmitCertification('certified')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Certify
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPredictions;
