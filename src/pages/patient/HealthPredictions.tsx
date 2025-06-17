import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, Heart, Target, Calendar } from 'lucide-react';

interface HealthPrediction {
  id: string;
  type: 'diabetes' | 'cardiovascular' | 'general';
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  factors: string[];
  recommendations: string[];
  basedOnReports: string[];
  predictionDate: string;
  nextAssessmentDue: string;
}

interface HealthMetric {
  name: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'danger';
}

const HealthPredictions = () => {
  const [predictions] = useState<HealthPrediction[]>([
    {
      id: '1',
      type: 'diabetes',
      riskLevel: 'medium',
      confidence: 78,
      factors: [
        'Family history of diabetes',
        'Elevated glucose levels in recent blood test',
        'BMI above normal range',
        'Sedentary lifestyle indicators'
      ],
      recommendations: [
        'Increase physical activity to 150 minutes per week',
        'Adopt a low-glycemic diet',
        'Monitor blood glucose levels weekly',
        'Schedule follow-up appointment in 3 months'
      ],
      basedOnReports: ['Blood Test - 2024-01-15', 'Blood Test - 2023-12-20'],
      predictionDate: '2024-01-16',
      nextAssessmentDue: '2024-04-16'
    },
    {
      id: '2',
      type: 'cardiovascular',
      riskLevel: 'low',
      confidence: 85,
      factors: [
        'Normal blood pressure',
        'Healthy cholesterol levels',
        'Regular exercise routine',
        'Non-smoker'
      ],
      recommendations: [
        'Continue current exercise routine',
        'Maintain heart-healthy diet',
        'Annual cardiovascular screening'
      ],
      basedOnReports: ['Blood Test - 2024-01-15', 'Physical Exam - 2024-01-10'],
      predictionDate: '2024-01-16',
      nextAssessmentDue: '2025-01-16'
    }
  ]);

  const [healthMetrics] = useState<HealthMetric[]>([
    {
      name: 'Blood Glucose',
      current: 110,
      target: 100,
      unit: 'mg/dL',
      trend: 'up',
      status: 'warning'
    },
    {
      name: 'Blood Pressure',
      current: 120,
      target: 120,
      unit: 'mmHg',
      trend: 'stable',
      status: 'good'
    },
    {
      name: 'BMI',
      current: 26.5,
      target: 24.9,
      unit: 'kg/m²',
      trend: 'down',
      status: 'warning'
    },
    {
      name: 'Cholesterol',
      current: 180,
      target: 200,
      unit: 'mg/dL',
      trend: 'stable',
      status: 'good'
    }
  ]);

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

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'success';
      case 'warning':
        return 'warning';
      case 'danger':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'diabetes':
        return <Target className="w-6 h-6 text-blue-500" />;
      case 'cardiovascular':
        return <Heart className="w-6 h-6 text-red-500" />;
      default:
        return <Activity className="w-6 h-6 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Health Predictions & Risk Assessment</h1>
        <Badge variant="info" className="text-sm">
          Last Updated: {new Date().toLocaleDateString()}
        </Badge>
      </div>

      {/* Health Metrics Overview */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Health Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {healthMetrics.map((metric, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-gray-900">{metric.name}</h3>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {metric.current} {metric.unit}
                  </span>
                  <Badge variant={getMetricStatusColor(metric.status)} size="sm">
                    {metric.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  Target: {metric.target} {metric.unit}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Risk Predictions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">AI Risk Predictions</h2>
        
        {predictions.map((prediction) => (
          <Card key={prediction.id}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {getTypeIcon(prediction.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-medium text-gray-900 capitalize">
                    {prediction.type} Risk Assessment
                  </h3>
                  <Badge variant={getRiskColor(prediction.riskLevel)}>
                    {prediction.riskLevel.toUpperCase()} RISK
                  </Badge>
                  <div className="text-sm text-gray-500">
                    {prediction.confidence}% confidence
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Risk Factors */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1 text-orange-500" />
                      Contributing Factors
                    </h4>
                    <ul className="space-y-1">
                      {prediction.factors.map((factor, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-1 text-blue-500" />
                      Recommendations
                    </h4>
                    <ul className="space-y-1">
                      {prediction.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Based on Reports & Timeline */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Prediction Date: {prediction.predictionDate}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Next Assessment: {prediction.nextAssessmentDue}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">Based on: </span>
                    <span className="text-sm text-gray-700">
                      {prediction.basedOnReports.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Need More Information?</h3>
            <p className="text-sm text-gray-500 mt-1">
              Schedule a consultation with your doctor to discuss these predictions in detail.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              View All Reports
            </Button>
            <Button>
              Schedule Appointment
            </Button>
          </div>
        </div>
      </Card>

      {predictions.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No predictions available</h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload medical reports to get AI-powered health predictions and risk assessments.
            </p>
            <Button className="mt-4">
              Contact Your Doctor
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default HealthPredictions;
