import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { 
  Activity, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  User,
  Brain,
  Calendar,
  ExternalLink,
  Play,
  RefreshCw
} from 'lucide-react';

interface PatientSubmission {
  id: string;
  patientId: string;
  adminId: string;
  healthData: {
    pregnancies: number;
    glucose: number;
    bmi: number;
    age: number;
    insulin: number;
  };
  predictionResult: number | null;
  predictionProbability: number | null;
  riskLevel: 'low' | 'medium' | 'high' | null;
  status: 'pending' | 'processing' | 'processed' | 'failed';
  patientNotes: string | null;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
  patientInfo: {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
  };
  adminName: string | null;
  isCertified: boolean;
  certificationStatus: string | null;
}

interface AdminDashboard {
  statistics: {
    totalSubmissions: number;
    pendingSubmissions: number;
    processingSubmissions: number;
    processedSubmissions: number;
    failedSubmissions: number;
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
    };
    averageProbability: number;
  };
  recentSubmissions: Array<{
    id: string;
    patientName: string;
    patientEmail: string;
    status: string;
    riskLevel: string;
    probability: number;
    createdAt: string;
    processedAt: string;
  }>;
  trends: Array<{
    date: string;
    submissions: number;
    processed: number;
    avgProbability: number;
  }>;
}

const AdminHealthPredictions = () => {
  const { user } = useAuthStore();
  const [submissions, setSubmissions] = useState<PatientSubmission[]>([]);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<PatientSubmission | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedStatus, page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [submissionsRes, dashboardRes] = await Promise.all([
        apiService.getPatientSubmissions({ 
          page, 
          limit: 10, 
          status: selectedStatus as any 
        }),
        apiService.getAdminHealthDashboard()
      ]);

      if (submissionsRes.success) {
        setSubmissions(submissionsRes.data.submissions || []);
        setHasMore(submissionsRes.data.pagination?.hasNext || false);
      }

      if (dashboardRes.success) {
        setDashboard(dashboardRes.data);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load patient submissions data');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessSubmission = async (submissionId: string) => {
    try {
      setProcessing(submissionId);
      setError(null);

      const response = await apiService.processPatientSubmission(submissionId);

      if (response.success) {
        // Refresh data to show updated status
        fetchData();
      } else {
        setError(response.message || 'Failed to process submission');
      }
    } catch (err) {
      console.error('Error processing submission:', err);
      setError('Failed to process submission');
    } finally {
      setProcessing(null);
    }
  };

  const handleViewDetails = async (submission: PatientSubmission) => {
    // Generate Streamlit URL with patient health data pre-filled
    const streamlitUrl = `${import.meta.env.VITE_STREAMLIT_URL || 'http://localhost:8502'}/?pregnancies=${submission.healthData.pregnancies}&glucose=${submission.healthData.glucose}&bmi=${submission.healthData.bmi}&age=${submission.healthData.age}&insulin=${submission.healthData.insulin}&auto_predict=true`;
    window.open(streamlitUrl, '_blank');
  };

  const handleShowDetailModal = async (submission: PatientSubmission) => {
    try {
      const response = await apiService.getPatientSubmissionById(submission.id);
      if (response.success) {
        setSelectedSubmission(response.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('Error fetching submission details:', err);
      setError('Failed to load submission details');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'pending':
        return 'default';
      case 'failed':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getRiskColor = (risk: string | null) => {
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

  if (loading && submissions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading patient submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Patient Health Data Processing</h1>
          <div className="flex items-center space-x-4">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Submissions</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="processed">Processed</option>
              <option value="failed">Failed</option>
            </select>
            <Button onClick={() => fetchData()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Statistics */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.statistics.totalSubmissions}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.statistics.pendingSubmissions}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <RefreshCw className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.statistics.processingSubmissions}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Processed</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.statistics.processedSubmissions}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <Brain className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Risk</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(dashboard.statistics.averageProbability * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Risk Distribution */}
        {dashboard && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Risk Assessment Distribution</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {dashboard.statistics.riskDistribution.low}
                </div>
                <div className="text-sm text-green-700">Low Risk</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {dashboard.statistics.riskDistribution.medium}
                </div>
                <div className="text-sm text-yellow-700">Medium Risk</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {dashboard.statistics.riskDistribution.high}
                </div>
                <div className="text-sm text-red-700">High Risk</div>
              </div>
            </div>
          </Card>
        )}

        {/* Patient Submissions List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Patient Health Data Submissions</h2>
          
          {submissions.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Activity className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedStatus === 'all' 
                    ? 'No patient health data submissions yet.'
                    : `No submissions with status: ${selectedStatus}`}
                </p>
              </div>
            </Card>
          ) : (
            submissions.map((submission) => (
              <Card key={submission.id}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <User className="w-8 h-8 text-blue-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {submission.patientInfo.name}
                      </h3>
                      <Badge variant={getStatusColor(submission.status)}>
                        {submission.status.toUpperCase()}
                      </Badge>
                      {submission.riskLevel && (
                        <Badge variant={getRiskColor(submission.riskLevel)}>
                          {submission.riskLevel.toUpperCase()} RISK
                        </Badge>
                      )}
                      {submission.predictionProbability && (
                        <span className="text-sm text-gray-500">
                          {(parseFloat(submission.predictionProbability.toString()) * 100).toFixed(1)}% probability
                        </span>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Patient Info */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          Patient Information
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{submission.patientInfo.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{submission.patientInfo.phone || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date of Birth:</span>
                            <span className="font-medium">
                              {submission.patientInfo.dateOfBirth 
                                ? new Date(submission.patientInfo.dateOfBirth).toLocaleDateString()
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Health Data */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                          <Activity className="w-4 h-4 mr-1" />
                          Health Data
                        </h4>
                        <div className="bg-blue-50 rounded-lg p-3 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Age:</span>
                            <span className="font-medium">{submission.healthData.age} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">BMI:</span>
                            <span className="font-medium">{parseFloat(submission.healthData.bmi).toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Glucose:</span>
                            <span className="font-medium">{submission.healthData.glucose} mg/dL</span>
                          </div>
                          {submission.healthData.pregnancies > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Pregnancies:</span>
                              <span className="font-medium">{submission.healthData.pregnancies}</span>
                            </div>
                          )}
                          {parseFloat(submission.healthData.insulin.toString()) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Insulin:</span>
                              <span className="font-medium">{submission.healthData.insulin}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* AI Results (if processed) */}
                    {submission.status === 'processed' && submission.predictionResult !== null && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                          <Brain className="w-4 h-4 mr-1" />
                          AI Prediction Results
                        </h4>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Prediction: {submission.predictionResult === 1 ? 'Diabetes Detected' : 'No Diabetes'}
                          </span>
                          <span className="text-sm font-bold">
                            Risk: {(parseFloat(submission.predictionProbability!.toString()) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        Submitted on {new Date(submission.createdAt).toLocaleDateString()}
                        {submission.processedAt && (
                          <span className="ml-2">
                            • Processed on {new Date(submission.processedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(submission)}
                          title="View analysis in Streamlit interface"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Analysis
                        </Button>
                        
                        {(submission.status === 'pending' || submission.status === 'failed') && (
                          <Button
                            size="sm"
                            onClick={() => handleProcessSubmission(submission.id)}
                            disabled={processing === submission.id}
                          >
                            {processing === submission.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-1" />
                                Process with AI
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Patient Submission Details"
        maxWidth="4xl"
      >
        {selectedSubmission && (
          <div className="space-y-6">
            {/* Patient Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Patient Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-sm text-gray-900">{selectedSubmission.patientInfo.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-sm text-gray-900">{selectedSubmission.patientInfo.email}</p>
                </div>
              </div>
            </div>

            {/* Health Data */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Health Data</h3>
              <div className="bg-blue-50 rounded-lg p-4 grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Age</label>
                  <p className="text-sm text-gray-900">{selectedSubmission.healthData.age} years</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">BMI</label>
                  <p className="text-sm text-gray-900">{selectedSubmission.healthData.bmi}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Glucose</label>
                  <p className="text-sm text-gray-900">{selectedSubmission.healthData.glucose} mg/dL</p>
                </div>
              </div>
            </div>

            {/* AI Results */}
            {selectedSubmission.status === 'processed' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">AI Prediction Results</h3>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm">
                    <strong>Prediction:</strong> {selectedSubmission.predictionResult === 1 ? 'Diabetes Detected' : 'No Diabetes'}
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Probability:</strong> {(parseFloat(selectedSubmission.predictionProbability!.toString()) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Risk Level:</strong> {selectedSubmission.riskLevel?.toUpperCase()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminHealthPredictions;