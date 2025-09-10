import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Upload, Download, Eye, Activity, FileText, Plus, Save, AlertCircle, CheckCircle, Search, X } from 'lucide-react';
import { apiService } from '../../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  const [activeTab, setActiveTab] = useState<'diabetes' | 'medical'>('diabetes');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [diabetesPredictions, setDiabetesPredictions] = useState<DiabetesPrediction[]>([]);
  const [medicalReports, setMedicalReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  // Patient search state
  const [diabetesPatientSearch, setDiabetesPatientSearch] = useState('');
  const [medicalPatientSearch, setMedicalPatientSearch] = useState('');
  const [isDiabetesDropdownOpen, setIsDiabetesDropdownOpen] = useState(false);
  const [isMedicalDropdownOpen, setIsMedicalDropdownOpen] = useState(false);

  useEffect(() => {
    fetchPatients();
    fetchDiabetesPredictions();
    fetchMedicalReports();
  }, []);

  // Initialize search fields when patient is selected
  useEffect(() => {
    if (diabetesForm.patientId && !diabetesPatientSearch) {
      setDiabetesPatientSearch(getSelectedPatientName(diabetesForm.patientId));
    }
  }, [diabetesForm.patientId, patients]);

  useEffect(() => {
    if (medicalForm.patientId && !medicalPatientSearch) {
      setMedicalPatientSearch(getSelectedPatientName(medicalForm.patientId));
    }
  }, [medicalForm.patientId, patients]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.patient-dropdown')) {
        setIsDiabetesDropdownOpen(false);
        setIsMedicalDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPatients = async () => {
    try {
      const token = apiService.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/reports/patients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setPatients(data.data.patients);
      } else {
        console.error('Failed to fetch patients:', data.message);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDiabetesPredictions = async () => {
    try {
      const token = apiService.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/reports/diabetes-predictions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
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
      const token = apiService.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/reports/medical-reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
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
      const token = apiService.getToken();
      console.log('Submitting diabetes prediction with form data:', diabetesForm);
      const response = await fetch(`${API_BASE_URL}/admin/reports/diabetes-predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diabetesForm),
      });

      const data = await response.json();
      if (data.success) {
        alert('Diabetes prediction created successfully!');
        setDiabetesForm({
          patientId: '',
          pregnancies: 0,
          glucose: 100,
          bmi: 25.0,
          age: 30,
          insulin: 0,
          notes: ''
        });
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

      const token = apiService.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/reports/medical-reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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

  // Helper functions for patient search
  const getFilteredPatients = (searchTerm: string) => {
    if (!searchTerm) return patients;
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getSelectedPatientName = (patientId: string) => {
    const patient = patients.find(p => p.patientId === patientId);
    return patient ? `${patient.name} (${patient.patientId})` : '';
  };

  const handleDiabetesPatientSelect = (patient: Patient) => {
    setDiabetesForm({ ...diabetesForm, patientId: patient.patientId });
    setDiabetesPatientSearch(`${patient.name} (${patient.patientId})`);
    setIsDiabetesDropdownOpen(false);
  };

  const handleMedicalPatientSelect = (patient: Patient) => {
    setMedicalForm({ ...medicalForm, patientId: patient.patientId });
    setMedicalPatientSearch(`${patient.name} (${patient.patientId})`);
    setIsMedicalDropdownOpen(false);
  };

  const clearDiabetesPatientSelection = () => {
    setDiabetesForm({ ...diabetesForm, patientId: '' });
    setDiabetesPatientSearch('');
    setIsDiabetesDropdownOpen(false);
  };

  const clearMedicalPatientSelection = () => {
    setMedicalForm({ ...medicalForm, patientId: '' });
    setMedicalPatientSearch('');
    setIsMedicalDropdownOpen(false);
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
                <div className="relative patient-dropdown">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient *
                  </label>
                  <div className="relative">
                    <div className="flex">
                      <input
                        type="text"
                        value={diabetesPatientSearch}
                        onChange={(e) => {
                          setDiabetesPatientSearch(e.target.value);
                          setIsDiabetesDropdownOpen(true);
                        }}
                        onFocus={() => setIsDiabetesDropdownOpen(true)}
                        placeholder="Search patients by name, ID, or email..."
                        className="w-full border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {diabetesForm.patientId && (
                        <button
                          type="button"
                          onClick={clearDiabetesPatientSelection}
                          className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Clear selection"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                      {!diabetesForm.patientId && (
                        <button
                          type="button"
                          onClick={() => setIsDiabetesDropdownOpen(!isDiabetesDropdownOpen)}
                          className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Open patient list"
                        >
                          <Search className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                    
                    {isDiabetesDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {getFilteredPatients(diabetesPatientSearch).length === 0 ? (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No patients found
                          </div>
                        ) : (
                          getFilteredPatients(diabetesPatientSearch).map((patient) => (
                            <button
                              key={patient.id}
                              type="button"
                              onClick={() => handleDiabetesPatientSelect(patient)}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-sm">{patient.name}</div>
                              <div className="text-xs text-gray-500">
                                ID: {patient.patientId} • {patient.email}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
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
                            window.open(streamlitUrl, '_blank');
                          }}
                          className="text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
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
                <div className="relative patient-dropdown">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient *
                  </label>
                  <div className="relative">
                    <div className="flex">
                      <input
                        type="text"
                        value={medicalPatientSearch}
                        onChange={(e) => {
                          setMedicalPatientSearch(e.target.value);
                          setIsMedicalDropdownOpen(true);
                        }}
                        onFocus={() => setIsMedicalDropdownOpen(true)}
                        placeholder="Search patients by name, ID, or email..."
                        className="w-full border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {medicalForm.patientId && (
                        <button
                          type="button"
                          onClick={clearMedicalPatientSelection}
                          className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Clear selection"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                      {!medicalForm.patientId && (
                        <button
                          type="button"
                          onClick={() => setIsMedicalDropdownOpen(!isMedicalDropdownOpen)}
                          className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Open patient list"
                        >
                          <Search className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                    
                    {isMedicalDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {getFilteredPatients(medicalPatientSearch).length === 0 ? (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No patients found
                          </div>
                        ) : (
                          getFilteredPatients(medicalPatientSearch).map((patient) => (
                            <button
                              key={patient.id}
                              type="button"
                              onClick={() => handleMedicalPatientSelect(patient)}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-sm">{patient.name}</div>
                              <div className="text-xs text-gray-500">
                                ID: {patient.patientId} • {patient.email}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Files *
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileSelection}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          onClick={() => window.open(`${API_BASE_URL}/admin/reports/medical-reports/${report.id}/download`)}
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
    </div>
  );
};

export default UploadReports;
