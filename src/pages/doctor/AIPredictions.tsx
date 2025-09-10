import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Eye, CheckCircle, AlertTriangle, FileText, Clock } from 'lucide-react';
import { apiService } from '../../services/api';

interface AIPrediction {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  pregnancies: number;
  glucose: number;
  bmi: number;
  age: number;
  insulin: number;
  predictionResult: 0 | 1;
  predictionProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'pending' | 'processed' | 'reviewed';
  createdAt: string;
  processedAt?: string;
  certification_status?: 'certified' | 'rejected';
  doctor_notes?: string;
  clinical_assessment?: string;
  recommendations?: string;
  follow_up_required?: boolean;
  follow_up_date?: string;
  severity_assessment?: 'low' | 'medium' | 'high' | 'critical';
  certified_at?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AIPredictions = () => {
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState<AIPrediction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const token = apiService.getToken();
      const response = await fetch(`${API_BASE_URL}/doctors/ai-predictions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setPredictions(data.data.predictions);
      } else {
        console.error('Failed to fetch diabetes predictions:', data.message);
      }
    } catch (error) {
      console.error('Error fetching diabetes predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewPrediction = (predictionId: string) => {
    const prediction = predictions.find(p => p.id === predictionId);
    if (prediction) {
      setSelectedPrediction(prediction);
      setDoctorNotes(prediction.doctor_notes || '');
      setIsModalOpen(true);
    }
  };

  const handleSubmitReview = async (action: 'certified' | 'rejected') => {
    if (selectedPrediction) {
      try {
        const token = apiService.getToken();
        const response = await fetch(`${API_BASE_URL}/doctors/ai-predictions/${selectedPrediction.id}/review`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            certification_status: action,
            doctor_notes: doctorNotes,
            clinical_assessment: '',
            recommendations: '',
            follow_up_required: false,
            severity_assessment: selectedPrediction.riskLevel
          }),
        });

        const data = await response.json();
        if (data.success) {
          setPredictions(prev => 
            prev.map(p => 
              p.id === selectedPrediction.id 
                ? { ...p, certification_status: action, doctor_notes: doctorNotes, status: 'reviewed' }
                : p
            )
          );
          setIsModalOpen(false);
          setSelectedPrediction(null);
          setDoctorNotes('');
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Error updating prediction:', error);
        alert('Failed to update prediction');
      }
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
      case 'processed':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCertificationColor = (status: string) => {
    switch (status) {
      case 'certified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingCount = predictions.filter(p => p.status === 'processed' && !p.certification_status).length;
  const processedCount = predictions.filter(p => p.status === 'processed').length;
  const reviewedCount = predictions.filter(p => p.status === 'reviewed').length;
  const certifiedCount = predictions.filter(p => p.certification_status === 'certified').length;
  const highRiskCount = predictions.filter(p => p.riskLevel === 'high').length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPredictionFactors = (prediction: AIPrediction) => {
    const factors = [];
    if (prediction.glucose > 126) factors.push('High glucose levels');
    if (prediction.bmi > 30) factors.push('High BMI');
    if (prediction.age > 45) factors.push('Age factor');
    if (prediction.pregnancies > 0) factors.push('Pregnancy history');
    if (prediction.insulin > 100) factors.push('Insulin levels');
    return factors.length > 0 ? factors : ['Normal parameters'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading predictions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">AI Diabetes Predictions</h1>
        <Button onClick={fetchPredictions} disabled={loading}>
          Refresh
        </Button>
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
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Processed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {processedCount}
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
                  Parameters
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Probability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key Factors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certification
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
                    <div className="text-sm text-gray-500">
                      ID: {prediction.patientId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div>Glucose: {prediction.glucose}</div>
                      <div>BMI: {prediction.bmi}</div>
                      <div>Age: {prediction.age}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getRiskColor(prediction.riskLevel)}>
                      {prediction.riskLevel} risk
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          {/* eslint-disable-next-line react/forbid-dom-props */}
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.round(prediction.predictionProbability * 100)}%` }}
                          ></div>
                        </div>
                        <span>{Math.round(prediction.predictionProbability * 100)}%</span>
                      </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      {getPredictionFactors(prediction).slice(0, 2).map((factor, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          • {factor}
                        </div>
                      ))}
                      {getPredictionFactors(prediction).length > 2 && (
                        <div className="text-xs text-gray-400">
                          +{getPredictionFactors(prediction).length - 2} more
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(prediction.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(prediction.status)}>
                      {prediction.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {prediction.certification_status ? (
                      <Badge className={getCertificationColor(prediction.certification_status)}>
                        {prediction.certification_status}
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">
                        Pending Review
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReviewPrediction(prediction.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {!prediction.certification_status && (
                        <Button
                          size="sm"
                          onClick={() => handleReviewPrediction(prediction.id)}
                          className="bg-blue-600 hover:bg-blue-700"
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
          {predictions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No AI predictions found
            </div>
          )}
        </div>
      </Card>

      {/* Review Modal */}
      {isModalOpen && selectedPrediction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedPrediction.certification_status ? 'View AI Prediction' : 'Certify AI Prediction'}
                </h3>
                {selectedPrediction.certification_status && (
                  <Badge className={getCertificationColor(selectedPrediction.certification_status)}>
                    {selectedPrediction.certification_status}
                  </Badge>
                )}
              </div>
              
              <div className="mb-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900">Prediction Summary</h4>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-gray-600">
                        Patient: {selectedPrediction.patientName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Risk Level: <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(selectedPrediction.riskLevel)}`}>
                          {selectedPrediction.riskLevel}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Probability: {Math.round(selectedPrediction.predictionProbability * 100)}%
                      </p>
                      <p className="text-sm text-gray-600">
                        Result: {selectedPrediction.predictionResult === 1 ? 'Positive' : 'Negative'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Glucose: {selectedPrediction.glucose} mg/dL</p>
                      <p className="text-sm text-gray-600">BMI: {selectedPrediction.bmi}</p>
                      <p className="text-sm text-gray-600">Age: {selectedPrediction.age} years</p>
                      <p className="text-sm text-gray-600">Pregnancies: {selectedPrediction.pregnancies}</p>
                      <p className="text-sm text-gray-600">Insulin: {selectedPrediction.insulin} μU/mL</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700">Key Risk Factors:</p>
                    <ul className="text-sm text-gray-600 mt-1">
                      {getPredictionFactors(selectedPrediction).map((factor, index) => (
                        <li key={index}>• {factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinical Notes {selectedPrediction.certification_status && '(Editable)'}
                </label>
                <textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add your clinical assessment, recommendations, or additional notes..."
                />
                {selectedPrediction.certified_at && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last certified: {new Date(selectedPrediction.certified_at).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  {selectedPrediction.certification_status ? 'Close' : 'Cancel'}
                </Button>
                {!selectedPrediction.certification_status && (
                  <>
                    <Button
                      onClick={() => handleSubmitReview('rejected')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleSubmitReview('certified')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Certify
                    </Button>
                  </>
                )}
                {selectedPrediction.certification_status && (
                  <Button
                    onClick={() => handleSubmitReview(selectedPrediction.certification_status === 'certified' ? 'rejected' : 'certified')}
                    className={selectedPrediction.certification_status === 'certified' 
                      ? "bg-red-600 hover:bg-red-700" 
                      : "bg-green-600 hover:bg-green-700"
                    }
                  >
                    {selectedPrediction.certification_status === 'certified' ? 'Change to Reject' : 'Change to Certify'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPredictions;
