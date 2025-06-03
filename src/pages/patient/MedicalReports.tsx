import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { FileText, Download, Calendar, Clock, Eye } from 'lucide-react';

interface MedicalReport {
  id: string;
  type: 'blood' | 'urine' | 'other';
  fileName: string;
  uploadDate: string;
  status: 'pending' | 'processed' | 'reviewed';
  aiPrediction?: {
    diabetesRisk: 'low' | 'medium' | 'high';
    confidence: number;
    factors: string[];
  };
  doctorNotes?: string;
}

const MedicalReports = () => {
  const [reports] = useState<MedicalReport[]>([
    {
      id: '1',
      type: 'blood',
      fileName: 'blood_test_2024_01_15.pdf',
      uploadDate: '2024-01-15',
      status: 'reviewed',
      aiPrediction: {
        diabetesRisk: 'medium',
        confidence: 78,
        factors: ['High glucose levels', 'Family history']
      },
      doctorNotes: 'Monitor glucose levels closely. Consider lifestyle changes.'
    },
    {
      id: '2',
      type: 'urine',
      fileName: 'urine_test_2024_01_10.pdf',
      uploadDate: '2024-01-10',
      status: 'processed',
      aiPrediction: {
        diabetesRisk: 'low',
        confidence: 92,
        factors: ['Normal protein levels']
      }
    },
    {
      id: '3',
      type: 'blood',
      fileName: 'blood_test_2023_12_20.pdf',
      uploadDate: '2023-12-20',
      status: 'reviewed',
      aiPrediction: {
        diabetesRisk: 'high',
        confidence: 85,
        factors: ['Elevated HbA1c', 'High glucose levels', 'BMI above normal']
      },
      doctorNotes: 'Immediate consultation required. Start medication as prescribed.'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processed':
        return 'info';
      case 'reviewed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    return <FileText className="w-5 h-5" />;
  };

  const downloadReport = (reportId: string) => {
    // Mock download functionality
    alert(`Downloading report ${reportId}...`);
  };

  const viewReport = (reportId: string) => {
    // Mock view functionality
    alert(`Opening report ${reportId} in viewer...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Medical Reports</h1>
        <div className="text-sm text-gray-500">
          Total Reports: {reports.length}
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-6">
        {reports.map((report) => (
          <Card key={report.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getTypeIcon(report.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {report.fileName}
                    </h3>
                    <Badge variant={getStatusColor(report.status)} className="capitalize">
                      {report.status}
                    </Badge>
                    <Badge className="capitalize bg-gray-100 text-gray-800">
                      {report.type} test
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="mr-4">Uploaded: {report.uploadDate}</span>
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Status: {report.status}</span>
                  </div>

                  {/* AI Prediction */}
                  {report.aiPrediction && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        AI Health Analysis
                      </h4>
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Diabetes Risk:</span>
                          <Badge variant={getRiskColor(report.aiPrediction.diabetesRisk)}>
                            {report.aiPrediction.diabetesRisk.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Confidence: {report.aiPrediction.confidence}%
                        </div>
                      </div>
                      
                      {report.aiPrediction.factors.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-600">Key Factors:</span>
                          <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                            {report.aiPrediction.factors.map((factor, index) => (
                              <li key={index}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Doctor Notes */}
                  {report.doctorNotes && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-3">
                      <h4 className="text-sm font-medium text-blue-900 mb-1">
                        Doctor's Notes
                      </h4>
                      <p className="text-sm text-blue-800">{report.doctorNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewReport(report.id)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReport(report.id)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {reports.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your medical reports will appear here once uploaded by your healthcare provider.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MedicalReports;
