import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Upload, Download, Eye } from 'lucide-react';

interface PatientReport {
  id: string;
  patientId: string;
  patientName: string;
  reportType: 'blood' | 'urine' | 'other';
  fileName: string;
  uploadDate: string;
  status: 'pending' | 'processed' | 'reviewed';
  aiPrediction?: {
    diabetesRisk: 'low' | 'medium' | 'high';
    confidence: number;
    factors: string[];
  };
}

const UploadReports = () => {
  const [reports, setReports] = useState<PatientReport[]>([
    {
      id: '1',
      patientId: 'p1',
      patientName: 'John Smith',
      reportType: 'blood',
      fileName: 'blood_test_john_smith.pdf',
      uploadDate: '2024-01-15',
      status: 'processed',
      aiPrediction: {
        diabetesRisk: 'medium',
        confidence: 78,
        factors: ['High glucose levels', 'Family history']
      }
    },
    {
      id: '2',
      patientId: 'p2',
      patientName: 'Sarah Johnson',
      reportType: 'urine',
      fileName: 'urine_test_sarah_johnson.pdf',
      uploadDate: '2024-01-14',
      status: 'pending'
    }
  ]);

  const [selectedPatient, setSelectedPatient] = useState('');
  const [reportType, setReportType] = useState<'blood' | 'urine' | 'other'>('blood');
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);

  // Mock patient data
  const patients = [
    { id: 'p1', name: 'John Smith' },
    { id: 'p2', name: 'Sarah Johnson' },
    { id: 'p3', name: 'Michael Brown' },
    { id: 'p4', name: 'Emily Davis' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadingFiles(Array.from(files));
    }
  };

  const handleUploadSubmit = () => {
    if (!selectedPatient || uploadingFiles.length === 0) {
      alert('Please select a patient and upload files');
      return;
    }

    const patient = patients.find(p => p.id === selectedPatient);
    if (!patient) return;

    uploadingFiles.forEach((file) => {
      const newReport: PatientReport = {
        id: Date.now().toString() + Math.random(),
        patientId: selectedPatient,
        patientName: patient.name,
        reportType: reportType,
        fileName: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      };

      setReports(prev => [...prev, newReport]);
    });

    // Reset form
    setSelectedPatient('');
    setUploadingFiles([]);
    setReportType('blood');
    
    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    alert('Reports uploaded successfully!');
  };

  const triggerAiAnalysis = (reportId: string) => {
    setReports(prev => prev.map(report => {
      if (report.id === reportId) {
        // Simulate AI analysis
        const mockPrediction = {
          diabetesRisk: Math.random() > 0.5 ? 'high' : 'medium' as 'high' | 'medium',
          confidence: Math.floor(Math.random() * 30) + 70,
          factors: ['High glucose levels', 'BMI above normal', 'Family history'].slice(0, Math.floor(Math.random() * 3) + 1)
        };

        return {
          ...report,
          status: 'processed' as const,
          aiPrediction: mockPrediction
        };
      }
      return report;
    }));
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Upload Medical Reports</h1>

      {/* Upload Section */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Reports</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Patient
            </label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a patient...</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'blood' | 'urine' | 'other')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="blood">Blood Test</option>
              <option value="urine">Urine Test</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Files
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Drop files here or click to upload
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="sr-only"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    PDF, JPG, PNG up to 10MB each
                  </p>
                </div>
              </div>
            </div>
            
            {uploadingFiles.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">Selected files:</p>
                <ul className="mt-1 text-sm text-gray-600">
                  {uploadingFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Button onClick={handleUploadSubmit} className="w-full">
            Upload Reports
          </Button>
        </div>
      </Card>

      {/* Reports List */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Reports</h2>
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
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI Prediction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.patientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {report.reportType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.fileName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.uploadDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {report.aiPrediction ? (
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(report.aiPrediction.diabetesRisk)}`}>
                          {report.aiPrediction.diabetesRisk} risk
                        </span>
                        <div className="text-xs text-gray-500">
                          {report.aiPrediction.confidence}% confidence
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Not analyzed</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      {report.status === 'pending' && (
                        <Button 
                          size="sm"
                          onClick={() => triggerAiAnalysis(report.id)}
                        >
                          Analyze
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
    </div>
  );
};

export default UploadReports;
