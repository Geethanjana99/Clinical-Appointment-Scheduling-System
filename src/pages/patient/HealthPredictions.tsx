import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { 
  Activity, 
  AlertTriangle, 
  Heart, 
  Target, 
  Calendar,
  Plus,
  BarChart3,
  ExternalLink,
  User,
  Clock
} from 'lucide-react';

interface HealthSubmission {
  id: string;
  patientId: string;
  pregnancies: number;
  glucose: number;
  bmi: number;
  age: number;
  insulin: number;
  notes: string | null;
  status: 'submitted' | 'processing' | 'certified' | 'requires_followup';
  createdAt: string;
  updatedAt: string;
  patientName: string;
  patientEmail: string;
  
  // Doctor certification data (only shown if certified)
  doctorReview?: {
    certificationId: string;
    certificationStatus: string;
    doctorNotes: string;
    clinicalAssessment: string;
    recommendations: string;
    followUpRequired: boolean;
    followUpDate?: string;
    severityAssessment: 'low' | 'medium' | 'high' | 'critical';
    certifiedAt: string;
    doctorName: string;
    doctorSpecialty: string;
  };
}

interface HealthDashboard {
  statistics: {
    totalSubmissions: number;
    pendingSubmissions: number;
    certifiedSubmissions: number;
    requiresFollowup: number;
    severityDistribution: {
      high: number;
      moderate: number;
      low: number;
    };
  };
  recentSubmissions: Array<{
    id: string;
    status: string;
    createdAt: string;
    certifiedAt?: string;
    severity?: string;
  }>;
}

interface PredictionFormData {
  pregnancies: number;
  glucose: number;
  bmi: number;
  age: number;
  insulin: number;
  notes: string;
}

const HealthPredictions = () => {
  const { user } = useAuthStore();
  const [submissions, setSubmissions] = useState<HealthSubmission[]>([]);
  const [dashboard, setDashboard] = useState<HealthDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const [formData, setFormData] = useState<PredictionFormData>({
    pregnancies: 0,
    glucose: 100,
    bmi: 25,
    age: user?.profile?.patientProfile?.date_of_birth 
      ? new Date().getFullYear() - new Date(user.profile.patientProfile.date_of_birth).getFullYear()
      : 30,
    insulin: 0,
    notes: ''
  });

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [submissionsRes, dashboardRes] = await Promise.all([
        apiService.getHealthSubmissions({ page: 1, limit: 10 }),
        apiService.getHealthDashboard()
      ]);

      if (submissionsRes.success) {
        const submissions = submissionsRes.data.submissions || [];
        // Flatten healthData and ensure each submission has required fields with defaults
        const validatedSubmissions = submissions.map((submission: any) => ({
          ...submission,
          // Flatten healthData fields to root level for easier access
          age: submission.healthData?.age || submission.age || 0,
          bmi: submission.healthData?.bmi || submission.bmi || null,
          glucose: submission.healthData?.glucose || submission.glucose || 0,
          pregnancies: submission.healthData?.pregnancies || submission.pregnancies || 0,
          insulin: submission.healthData?.insulin || submission.insulin || 0,
          status: submission.status || 'submitted',
          notes: submission.patientNotes || submission.notes || null
        }));
        setSubmissions(validatedSubmissions);
      }

      if (dashboardRes.success) {
        setDashboard(dashboardRes.data);
      }
    } catch (err) {
      console.error('Error fetching health data:', err);
      setError('Failed to load health submissions data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PredictionFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'notes' ? value : Number(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);

      const response = await apiService.submitHealthData(formData);

      if (response.success) {
        setResultData(response.data);
        setShowResultModal(true);
        setShowCreateModal(false);
        
        // Reset form
        setFormData({
          pregnancies: 0,
          glucose: 100,
          bmi: 25,
          age: user?.profile?.patientProfile?.date_of_birth 
            ? new Date().getFullYear() - new Date(user.profile.patientProfile.date_of_birth).getFullYear()
            : 30,
          insulin: 0,
          notes: ''
        });

        // Refresh data
        fetchHealthData();
      } else {
        setError(response.message || 'Failed to submit health data');
      }
    } catch (err) {
      console.error('Error submitting health data:', err);
      setError('Failed to submit health data');
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      case 'critical':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'certified':
        return 'success';
      case 'submitted':
      case 'processing':
        return 'warning';
      case 'requires_followup':
        return 'danger';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Health Data Submission & Doctor Recommendations</h1>
        <div className="flex items-center gap-3">
          <Badge variant="info" className="text-sm">
            Patient: {user?.name}
          </Badge>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Submit Health Data
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Statistics */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.statistics.totalSubmissions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Certified</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.statistics.certifiedSubmissions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.statistics.pendingSubmissions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Follow-up Required</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.statistics.requiresFollowup}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Severity Distribution */}
      {dashboard && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Severity Assessment Distribution</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {dashboard.statistics.severityDistribution.low}
              </div>
              <div className="text-sm text-green-700">Low Severity</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {dashboard.statistics.severityDistribution.moderate}
              </div>
              <div className="text-sm text-yellow-700">Moderate Severity</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {dashboard.statistics.severityDistribution.high}
              </div>
              <div className="text-sm text-red-700">High Severity</div>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Health Submissions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Health Data Submissions</h2>
        
        {submissions.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No health data submitted yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Submit your health data for professional evaluation and doctor recommendations.
              </p>
              <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Submit Health Data
              </Button>
            </div>
          </Card>
        ) : (
          submissions.filter(submission => submission && submission.id).map((submission) => (
            <Card key={submission.id}>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <Heart className="w-6 h-6 text-red-500" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Health Data Submission
                    </h3>
                    <Badge variant={getStatusColor(submission.status)}>
                      {(submission.status || '').replace('_', ' ').toUpperCase()}
                    </Badge>
                    {submission.doctorReview && submission.doctorReview.severityAssessment && (
                      <Badge variant={getSeverityColor(submission.doctorReview.severityAssessment)}>
                        {submission.doctorReview.severityAssessment.toUpperCase()} SEVERITY
                      </Badge>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Health Data */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        Health Information
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Age:</span>
                          <span className="font-medium">{submission.age && submission.age > 0 ? submission.age : 'N/A'} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">BMI:</span>
                          <span className="font-medium">{submission.bmi && !isNaN(submission.bmi) ? Number(submission.bmi).toFixed(1) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Glucose:</span>
                          <span className="font-medium">{submission.glucose && submission.glucose > 0 ? submission.glucose : 'N/A'} mg/dL</span>
                        </div>
                        {(submission.pregnancies || 0) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pregnancies:</span>
                            <span className="font-medium">{submission.pregnancies}</span>
                          </div>
                        )}
                        {(submission.insulin || 0) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Insulin:</span>
                            <span className="font-medium">{submission.insulin}</span>
                          </div>
                        )}
                        {submission.notes && (
                          <div className="pt-2 border-t border-gray-200">
                            <span className="text-gray-600 block">Notes:</span>
                            <span className="font-medium">{submission.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Doctor Recommendations */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                        <Activity className="w-4 h-4 mr-1" />
                        Professional Assessment
                      </h4>
                      
                      {submission.doctorReview ? (
                        <div className="bg-blue-50 rounded-lg p-3 space-y-3 text-sm">
                          <div>
                            <span className="text-gray-600 block">Doctor:</span>
                            <span className="font-medium">{submission.doctorReview.doctorName || 'N/A'}</span>
                            <span className="text-gray-500 text-xs block">
                              {submission.doctorReview.doctorSpecialty || 'N/A'}
                            </span>
                          </div>

                          {submission.doctorReview.clinicalAssessment && (
                            <div>
                              <span className="text-gray-600 block">Clinical Assessment:</span>
                              <p className="font-medium text-gray-800 whitespace-pre-wrap">
                                {submission.doctorReview.clinicalAssessment}
                              </p>
                            </div>
                          )}
                          
                          {submission.doctorReview.recommendations && (
                            <div>
                              <span className="text-gray-600 block">Recommendations:</span>
                              <p className="font-medium text-gray-800 whitespace-pre-wrap">
                                {submission.doctorReview.recommendations}
                              </p>
                            </div>
                          )}
                          
                          {submission.doctorReview.doctorNotes && (
                            <div>
                              <span className="text-gray-600 block">Doctor Notes:</span>
                              <p className="font-medium text-gray-800 whitespace-pre-wrap">
                                {submission.doctorReview.doctorNotes}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-gray-600 block">Severity Assessment:</span>
                              <Badge variant={getSeverityColor(submission.doctorReview.severityAssessment)}>
                                {submission.doctorReview.severityAssessment.toUpperCase()}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-600 block">Status:</span>
                              <Badge variant={submission.doctorReview.certificationStatus === 'certified' ? 'success' : 'warning'}>
                                {submission.doctorReview.certificationStatus.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          
                          {submission.doctorReview.followUpRequired && (
                            <div className="bg-yellow-100 rounded p-2">
                              <span className="text-yellow-800 font-medium text-xs flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Follow-up Required
                                {submission.doctorReview.followUpDate && (
                                  <span className="ml-2">
                                    by {new Date(submission.doctorReview.followUpDate).toLocaleDateString()}
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 pt-2 border-t border-blue-200">
                            Certified on {new Date(submission.doctorReview.certifiedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 rounded-lg p-3 text-center">
                          <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                          <p className="text-yellow-800 font-medium text-sm">
                            {submission.status === 'submitted' ? 'Waiting for admin processing' :
                             submission.status === 'processing' ? 'Under medical review' :
                             'Pending professional assessment'}
                          </p>
                          <p className="text-yellow-600 text-xs mt-1">
                            You will be notified when doctor recommendations are available
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Submitted on {new Date(submission.createdAt).toLocaleDateString()}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {submission.doctorReview && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setResultData({
                              submission,
                              doctorReview: submission.doctorReview
                            });
                            setShowResultModal(true);
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Details
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

      {/* Submit Health Data Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Submit Health Data for Professional Evaluation"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Glucose Level (mg/dL) *
              </label>
              <input
                type="number"
                min="40"
                max="300"
                step="0.1"
                required
                value={formData.glucose}
                onChange={(e) => handleInputChange('glucose', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                BMI *
              </label>
              <input
                type="number"
                min="10"
                max="60"
                step="0.1"
                required
                value={formData.bmi}
                onChange={(e) => handleInputChange('bmi', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="25.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Age *
              </label>
              <input
                type="number"
                min="16"
                max="120"
                required
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pregnancies
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={formData.pregnancies}
                onChange={(e) => handleInputChange('pregnancies', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Insulin Level
              </label>
              <input
                type="number"
                min="0"
                max="300"
                step="0.1"
                value={formData.insulin}
                onChange={(e) => handleInputChange('insulin', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional notes about your health condition..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit Health Data'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Result Modal */}
      <Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title="Health Data Submission Confirmation"
        maxWidth="2xl"
      >
        {resultData && (
          <div className="space-y-6">
            {/* Submission Confirmation */}
            <div className="p-6 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center mb-4">
                <Heart className="w-8 h-8 mr-3 text-green-500" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Health Data Submitted Successfully
                  </h3>
                  <p className="text-lg text-gray-700">
                    Your health information has been received for professional evaluation
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-500" />
                What Happens Next
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">Admin will process your health data for AI analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">Doctor will review AI predictions and provide professional recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">You'll receive doctor's recommendations and clinical notes</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">Follow-up appointments may be scheduled if needed</span>
                </li>
              </ul>
            </div>

            {/* Important Note */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h5 className="font-medium text-yellow-800">Important Note</h5>
                  <p className="text-sm text-yellow-700 mt-1">
                    This system provides professional medical recommendations only. 
                    Always consult with your healthcare provider for medical decisions.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                <User className="w-4 h-4 inline mr-1" />
                Patient: {user?.name}
              </div>
              <div className="flex space-x-3">
                <Button onClick={() => setShowResultModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HealthPredictions;
