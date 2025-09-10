import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Upload, Download, Eye, Activity, FileText, Plus, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface Patient {
  id: string;
  patientId: string;
  name: string;
  email: string;
}

interface DiabetesPrediction {
  id: string;
  patientId: string;
  patientName: string;
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
  summary?: {
    prediction: string;
    probability: string;
    riskLevel: string;
    recommendations: string[];
  };
}

interface DiabetesPredictionResponse {
  success: boolean;
  message: string;
  data: {
    prediction: DiabetesPrediction;
    summary: {
      prediction: string;
      probability: string;
      riskLevel: string;
      recommendations: string[];
    };
    streamlitUrl: string;
    actions: {
      viewDetails: {
        url: string;
        label: string;
        description: string;
      };
      retryPrediction?: {
        endpoint: string;
        method: string;
        label: string;
        description: string;
      };
    };
  };
}

interface MedicalReport {
  id: string;
  patientId: string;
  patientName: string;
  reportType: string;
  title: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  status: 'uploaded' | 'processing' | 'processed' | 'reviewed';
}

const UploadReports = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'diabetes' | 'medical'>('diabetes');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [diabetesPredictions, setDiabetesPredictions] = useState<DiabetesPrediction[]>([]);
  const [medicalReports, setMedicalReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Results modal state
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [predictionResult, setPredictionResult] = useState<DiabetesPredictionResponse['data'] | null>(null);
  
  const [lastPrediction, setLastPrediction] = useState<DiabetesPrediction | null>(null);
  const [lastSummary, setLastSummary] = useState<{
    prediction: string;
    probability: string;
    riskLevel: string;
    recommendations: string[];
  } | null>(null);

  // Diabetes prediction form state
  const [diabetesForm, setDiabetesForm] = useState({
    patientId: '',
    pregnancies: 0,
    glucose: 100,
    bmi: 25.0,
    age: 30,
    insulin: 0,
    notes: ''
  });

  // Medical report form state
  const [medicalForm, setMedicalForm] = useState({
    patientId: '',
    reportType: 'lab_report',
    title: '',
    description: '',
    isConfidential: false,
    notes: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchPatients();
    fetchDiabetesPredictions();
    fetchMedicalReports();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/admin/reports/patients', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setPatients(data.data.patients);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDiabetesPredictions = async () => {
    try {
      const response = await fetch('/api/admin/reports/diabetes-predictions', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setDiabetesPredictions(data.data.predictions);
      }
    } catch (error) {
      console.error('Error fetching diabetes predictions:', error);
    }
  };

  const fetchMedicalReports = async () => {
    try {
      const response = await fetch('/api/admin/reports/medical-reports', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setMedicalReports(data.data.reports);
      }
    } catch (error) {
      console.error('Error fetching medical reports:', error);
    }
  };

  const submitDiabetesPrediction = async () => {
    if (!diabetesForm.patientId || !diabetesForm.glucose || !diabetesForm.bmi || !diabetesForm.age) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/reports/diabetes-predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(user as any)?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diabetesForm),
      });

      const data: DiabetesPredictionResponse = await response.json();
      
      if (data.success) {
        // Store the complete result data
        setPredictionResult(data.data);
        
        // Show the results modal
        setShowResultsModal(true);
        
        // Update legacy state for compatibility
        if (data.data?.summary) setLastSummary(data.data.summary);
        if (data.data?.prediction) setLastPrediction(data.data.prediction);
        
        // Reset form
        setDiabetesForm({
          patientId: '',
          pregnancies: 0,
          glucose: 100,
          bmi: 25.0,
          age: 30,
          insulin: 0,
          notes: ''
        });
        
        // Refresh the predictions list
        fetchDiabetesPredictions();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error creating diabetes prediction:', error);
      alert('Failed to create diabetes prediction');
    } finally {
      setLoading(false);
    }
  };

  const retryPrediction = async (retryAction: DiabetesPredictionResponse['data']['actions']['retryPrediction']) => {
    if (!retryAction) return;
    
    setLoading(true);
    try {
      const response = await fetch(retryAction.endpoint, {
        method: retryAction.method,
        headers: {
          'Authorization': `Bearer ${(user as any)?.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: DiabetesPredictionResponse = await response.json();
      
      if (data.success) {
        // Update the result with new data
        setPredictionResult(data.data);
        alert('Diabetes prediction retry successful!');
        fetchDiabetesPredictions();
      } else {
        alert(`Retry failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error retrying diabetes prediction:', error);
      alert('Failed to retry diabetes prediction');
    } finally {
      setLoading(false);
    }
  };

  const openStreamlitAnalysis = (streamlitUrl: string) => {
    window.open(streamlitUrl, '_blank');
  };

  const submitMedicalReports = async () => {
    if (!medicalForm.patientId || selectedFiles.length === 0) {
      alert('Please select a patient and upload files');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('patientId', medicalForm.patientId);
      formData.append('reportType', medicalForm.reportType);
      formData.append('title', medicalForm.title);
      formData.append('description', medicalForm.description);
      formData.append('isConfidential', medicalForm.isConfidential.toString());
      formData.append('notes', medicalForm.notes);
      
      selectedFiles.forEach((file) => {
        formData.append('reports', file);
      });

      const response = await fetch('/api/admin/reports/medical-reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        alert(`${selectedFiles.length} report(s) uploaded successfully!`);
        setMedicalForm({
          patientId: '',
          reportType: 'lab_report',
          title: '',
          description: '',
          isConfidential: false,
          notes: ''
        });
        setSelectedFiles([]);
        fetchMedicalReports();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error uploading medical reports:', error);
      alert('Failed to upload medical reports');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPredictionIcon = (prediction: 0 | 1) => {
    return prediction === 1 ? (
      <AlertCircle className="w-5 h-5 text-red-500" />
    ) : (
      <CheckCircle className="w-5 h-5 text-green-500" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Report Upload</h1>
          <p className="text-gray-600 mt-1">
            Upload diabetes prediction data and medical reports for patients
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('diabetes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'diabetes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Diabetes Prediction
          </button>
          <button
            onClick={() => setActiveTab('medical')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'medical'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Medical Reports
          </button>
        </nav>
      </div>

      {/* Diabetes Prediction Tab */}
      {activeTab === 'diabetes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                New Diabetes Prediction
              </h3>
              
              <div className="space-y-4">
                {/* Patient Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient *
                  </label>
                  <select
                    value={diabetesForm.patientId}
                    onChange={(e) => setDiabetesForm({ ...diabetesForm, patientId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Select Patient"
                  >
                    <option value="">Select a patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} ({patient.patientId})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Essential Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Glucose (mg/dL) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      step="0.1"
                      value={diabetesForm.glucose}
                      onChange={(e) => setDiabetesForm({ ...diabetesForm, glucose: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      BMI *
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="70"
                      step="0.1"
                      value={diabetesForm.bmi}
                      onChange={(e) => setDiabetesForm({ ...diabetesForm, bmi: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="25.0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age (years) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={diabetesForm.age}
                      onChange={(e) => setDiabetesForm({ ...diabetesForm, age: parseInt(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pregnancies
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={diabetesForm.pregnancies}
                      onChange={(e) => setDiabetesForm({ ...diabetesForm, pregnancies: parseInt(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Insulin (μU/mL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    step="0.1"
                    value={diabetesForm.insulin}
                    onChange={(e) => setDiabetesForm({ ...diabetesForm, insulin: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={diabetesForm.notes}
                    onChange={(e) => setDiabetesForm({ ...diabetesForm, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Additional notes or observations..."
                  />
                </div>

                <Button
                  onClick={submitDiabetesPrediction}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Processing...' : 'Create Prediction'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Recent Predictions */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Predictions
              </h3>
              {lastSummary && (
                <div className="mb-4 border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900">Latest Result</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(lastSummary.riskLevel)}`}>
                      {lastSummary.riskLevel?.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <div>Prediction: {lastSummary.prediction}</div>
                    <div>Probability: {lastSummary.probability}</div>
                  </div>
                  {lastSummary.recommendations?.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-gray-600 mb-1">Recommendations:</div>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {lastSummary.recommendations.slice(0, 4).map((rec: string, idx: number) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {diabetesPredictions.slice(0, 10).map((prediction) => (
                  <div key={prediction.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          {getPredictionIcon(prediction.predictionResult)}
                          <span className="font-medium text-sm">
                            {prediction.patientName}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(prediction.riskLevel)}`}>
                            {prediction.riskLevel?.toUpperCase()}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          <div>Result: {prediction.predictionResult === 1 ? 'Diabetes' : 'No Diabetes'}</div>
                          <div>Probability: {(prediction.predictionProbability * 100).toFixed(1)}%</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(prediction.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const streamlitUrl = `${import.meta.env.VITE_STREAMLIT_URL || 'http://localhost:8502'}/?pregnancies=${prediction.pregnancies}&glucose=${prediction.glucose}&bmi=${prediction.bmi}&age=${prediction.age}&insulin=${prediction.insulin}&auto_predict=true`;
                            openStreamlitAnalysis(streamlitUrl);
                          }}
                          className="text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                        {prediction.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => retryPrediction({
                              endpoint: `/api/admin/reports/diabetes-predictions/${prediction.id}/retry`,
                              method: 'POST',
                              label: 'Retry',
                              description: 'Retry prediction processing'
                            })}
                            disabled={loading}
                            className="text-xs"
                          >
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {diabetesPredictions.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No predictions yet
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Medical Reports Tab */}
      {activeTab === 'medical' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Form */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload Medical Reports
              </h3>
              
              <div className="space-y-4">
                {/* Patient Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient *
                  </label>
                  <select
                    value={medicalForm.patientId}
                    onChange={(e) => setMedicalForm({ ...medicalForm, patientId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Select Patient"
                  >
                    <option value="">Select a patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} ({patient.patientId})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Type *
                  </label>
                  <select
                    value={medicalForm.reportType}
                    onChange={(e) => setMedicalForm({ ...medicalForm, reportType: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Select Report Type"
                  >
                    <option value="lab_report">Lab Report</option>
                    <option value="blood_test">Blood Test</option>
                    <option value="urine_test">Urine Test</option>
                    <option value="x_ray">X-Ray</option>
                    <option value="mri">MRI</option>
                    <option value="ct_scan">CT Scan</option>
                    <option value="ultrasound">Ultrasound</option>
                    <option value="ecg">ECG</option>
                    <option value="prescription">Prescription</option>
                    <option value="discharge_summary">Discharge Summary</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={medicalForm.title}
                    onChange={(e) => setMedicalForm({ ...medicalForm, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Report title (optional)"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={medicalForm.description}
                    onChange={(e) => setMedicalForm({ ...medicalForm, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Brief description of the report..."
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label htmlFor="reports-upload" className="block text-sm font-medium text-gray-700 mb-1">
                    Files *
                  </label>
                  <input
                    id="reports-upload"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileSelection}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Upload medical report files"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB each)
                  </p>
                  {selectedFiles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">Selected files:</p>
                      <ul className="text-sm text-gray-600">
                        {selectedFiles.map((file, index) => (
                          <li key={index}>• {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Confidential Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="confidential"
                    checked={medicalForm.isConfidential}
                    onChange={(e) => setMedicalForm({ ...medicalForm, isConfidential: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="confidential" className="ml-2 block text-sm text-gray-700">
                    Mark as confidential
                  </label>
                </div>

                <Button
                  onClick={submitMedicalReports}
                  disabled={uploading}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Reports'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Recent Uploads */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Uploads
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {medicalReports.slice(0, 10).map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-sm">
                            {report.patientName}
                          </span>
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                            {report.reportType.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          <div className="font-medium">{report.title || report.fileName}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {(report.fileSize / 1024 / 1024).toFixed(2)} MB • {new Date(report.uploadDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/api/admin/reports/medical-reports/${report.id}/download`)}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {medicalReports.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No reports uploaded yet
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && predictionResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Diabetes Risk Assessment Results
              </h2>
              <button
                onClick={() => setShowResultsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Risk Level Display */}
            <div className={`p-6 rounded-lg mb-6 ${
              predictionResult.summary.riskLevel === 'high' 
                ? 'bg-red-50 border border-red-200' 
                : predictionResult.summary.riskLevel === 'medium'
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center space-x-3 mb-3">
                {predictionResult.summary.riskLevel === 'high' ? (
                  <AlertCircle className="w-8 h-8 text-red-500" />
                ) : predictionResult.summary.riskLevel === 'medium' ? (
                  <AlertCircle className="w-8 h-8 text-yellow-500" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                )}
                <div>
                  <h3 className={`text-xl font-bold ${
                    predictionResult.summary.riskLevel === 'high' 
                      ? 'text-red-800' 
                      : predictionResult.summary.riskLevel === 'medium'
                      ? 'text-yellow-800'
                      : 'text-green-800'
                  }`}>
                    {predictionResult.summary.prediction}
                  </h3>
                  <p className={`text-sm ${
                    predictionResult.summary.riskLevel === 'high' 
                      ? 'text-red-600' 
                      : predictionResult.summary.riskLevel === 'medium'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}>
                    Probability: {predictionResult.summary.probability} • Risk Level: {predictionResult.summary.riskLevel.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Patient Information */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Input Parameters</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Pregnancies:</span> {predictionResult.prediction.pregnancies}</div>
                <div><span className="font-medium">Glucose:</span> {predictionResult.prediction.glucose} mg/dL</div>
                <div><span className="font-medium">BMI:</span> {predictionResult.prediction.bmi}</div>
                <div><span className="font-medium">Age:</span> {predictionResult.prediction.age} years</div>
                <div><span className="font-medium">Insulin:</span> {predictionResult.prediction.insulin} μU/mL</div>
              </div>
            </div>

            {/* Recommendations */}
            {predictionResult.summary.recommendations && predictionResult.summary.recommendations.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Clinical Recommendations</h4>
                <ul className="space-y-2">
                  {predictionResult.summary.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => openStreamlitAnalysis(predictionResult.actions.viewDetails.url)}
                className="flex-1"
              >
                <Activity className="w-4 h-4 mr-2" />
                {predictionResult.actions.viewDetails.label}
              </Button>

              {predictionResult.prediction.status === 'pending' && predictionResult.actions.retryPrediction && (
                <Button
                  onClick={() => retryPrediction(predictionResult.actions.retryPrediction)}
                  variant="outline"
                  disabled={loading}
                  className="flex-1"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {loading ? 'Retrying...' : predictionResult.actions.retryPrediction.label}
                </Button>
              )}

              <Button
                onClick={() => setShowResultsModal(false)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>

            {/* Helper Text */}
            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>{predictionResult.actions.viewDetails.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadReports;
