# MongoDB Database Schema for Medical Records

This document outlines the MongoDB database structure for storing medical records and AI-related data in the Clinical Appointment Scheduling System.

## Overview
MongoDB is used for storing complex medical data, AI predictions, and related documents that benefit from a flexible, document-based structure.

---

## Collections

### 1. medical_reports
Stores medical reports and associated AI predictions

```javascript
{
  _id: ObjectId,
  patientId: String, // Reference to patient in MySQL
  doctorId: String, // Reference to doctor in MySQL
  appointmentId: String, // Reference to appointment in MySQL
  fileName: String,
  fileType: String, // 'blood', 'urine', 'xray', 'mri', 'other'
  filePath: String, // Storage location
  fileSize: Number,
  mimeType: String,
  uploadDate: Date,
  lastModified: Date,
  description: String,
  status: String, // 'pending', 'processed', 'reviewed', 'archived'
  
  // AI Prediction Data
  aiPrediction: {
    diabetesRisk: String, // 'low', 'medium', 'high'
    confidence: Number, // 0-100
    factors: [String],
    analysisDate: Date,
    modelVersion: String,
    processingTime: Number, // milliseconds
    additionalMetrics: {
      glucoseLevel: Number,
      hba1c: Number,
      bmi: Number,
      bloodPressure: {
        systolic: Number,
        diastolic: Number
      }
    }
  },
  
  // Doctor Review
  doctorReview: {
    reviewDate: Date,
    doctorNotes: String,
    certification: String, // 'certified', 'rejected', 'needs_review'
    recommendations: [String],
    followUpRequired: Boolean,
    followUpDate: Date
  },
  
  // Metadata
  tags: [String],
  isConfidential: Boolean,
  accessLog: [{
    userId: String,
    userRole: String,
    accessDate: Date,
    action: String // 'view', 'download', 'edit', 'delete'
  }],
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
db.medical_reports.createIndex({ "patientId": 1 })
db.medical_reports.createIndex({ "doctorId": 1 })
db.medical_reports.createIndex({ "uploadDate": -1 })
db.medical_reports.createIndex({ "status": 1 })
db.medical_reports.createIndex({ "aiPrediction.diabetesRisk": 1 })
db.medical_reports.createIndex({ "fileType": 1, "uploadDate": -1 })
```

---

### 2. health_metrics
Stores patient health data over time

```javascript
{
  _id: ObjectId,
  patientId: String, // Reference to patient in MySQL
  
  // Time-series health data
  metrics: [{
    date: Date,
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      measurementTime: Date
    },
    sugarLevel: Number,
    weight: Number,
    height: Number,
    bmi: Number,
    heartRate: Number,
    temperature: Number,
    oxygenSaturation: Number,
    notes: String,
    measuredBy: String, // 'patient', 'nurse', 'doctor'
    deviceUsed: String
  }],
  
  // Calculated trends
  trends: {
    bloodPressureTrend: String, // 'improving', 'stable', 'deteriorating'
    sugarLevelTrend: String,
    weightTrend: String,
    lastCalculated: Date
  },
  
  // Health goals
  healthGoals: [{
    metric: String, // 'blood_pressure', 'sugar_level', 'weight'
    targetValue: Number,
    targetRange: {
      min: Number,
      max: Number
    },
    setDate: Date,
    targetDate: Date,
    achieved: Boolean,
    achievedDate: Date
  }],
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
db.health_metrics.createIndex({ "patientId": 1 })
db.health_metrics.createIndex({ "metrics.date": -1 })
db.health_metrics.createIndex({ "patientId": 1, "metrics.date": -1 })
```

---

### 3. ai_predictions
Stores AI analysis results and predictions

```javascript
{
  _id: ObjectId,
  predictionId: String, // Unique identifier
  patientId: String,
  reportId: ObjectId, // Reference to medical_reports collection
  
  // Prediction details
  predictionType: String, // 'diabetes_risk', 'heart_disease', 'hypertension'
  inputData: {
    reportType: String,
    labValues: Object,
    patientHistory: Object,
    demographicData: Object
  },
  
  // Results
  prediction: {
    riskLevel: String, // 'low', 'medium', 'high', 'critical'
    probability: Number, // 0-1
    confidence: Number, // 0-100
    riskFactors: [{
      factor: String,
      impact: Number, // 0-1
      description: String
    }],
    protectiveFactors: [{
      factor: String,
      impact: Number,
      description: String
    }]
  },
  
  // Model information
  modelInfo: {
    modelName: String,
    modelVersion: String,
    trainingDate: Date,
    accuracy: Number,
    sensitivity: Number,
    specificity: Number
  },
  
  // Processing details
  processingTime: Number,
  analysisDate: Date,
  status: String, // 'pending', 'completed', 'certified', 'rejected'
  
  // Doctor certification
  certification: {
    doctorId: String,
    certificationDate: Date,
    action: String, // 'certified', 'rejected', 'needs_review'
    notes: String,
    recommendedActions: [String]
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
db.ai_predictions.createIndex({ "patientId": 1 })
db.ai_predictions.createIndex({ "predictionType": 1 })
db.ai_predictions.createIndex({ "status": 1 })
db.ai_predictions.createIndex({ "analysisDate": -1 })
db.ai_predictions.createIndex({ "prediction.riskLevel": 1 })
```

---

### 4. patient_health_summary
Aggregated health summary for quick access

```javascript
{
  _id: ObjectId,
  patientId: String,
  
  // Current health status
  currentStatus: {
    overallRisk: String, // 'low', 'medium', 'high'
    primaryConcerns: [String],
    lastAssessment: Date,
    nextRecommendedCheckup: Date
  },
  
  // Risk assessments
  riskAssessments: {
    diabetesRisk: {
      level: String,
      lastAssessment: Date,
      confidence: Number,
      trend: String // 'improving', 'stable', 'worsening'
    },
    cardiovascularRisk: {
      level: String,
      lastAssessment: Date,
      confidence: Number,
      trend: String
    },
    hypertensionRisk: {
      level: String,
      lastAssessment: Date,
      confidence: Number,
      trend: String
    }
  },
  
  // Latest vital signs
  latestVitals: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      date: Date
    },
    bloodSugar: {
      value: Number,
      date: Date,
      type: String // 'fasting', 'random', 'post_meal'
    },
    bmi: {
      value: Number,
      category: String, // 'underweight', 'normal', 'overweight', 'obese'
      date: Date
    }
  },
  
  // Alert flags
  alerts: [{
    type: String, // 'critical', 'warning', 'info'
    message: String,
    triggeredDate: Date,
    resolved: Boolean,
    resolvedDate: Date
  }],
  
  // Care plan summary
  carePlan: {
    activePlan: Boolean,
    planType: String,
    startDate: Date,
    goals: [String],
    interventions: [String],
    nextReview: Date
  },
  
  lastUpdated: Date,
  createdAt: Date
}
```

**Indexes:**
```javascript
db.patient_health_summary.createIndex({ "patientId": 1 }, { unique: true })
db.patient_health_summary.createIndex({ "currentStatus.overallRisk": 1 })
db.patient_health_summary.createIndex({ "alerts.type": 1, "alerts.resolved": 1 })
```

---

### 5. medical_images
Stores medical imaging data and metadata

```javascript
{
  _id: ObjectId,
  patientId: String,
  reportId: ObjectId, // Reference to medical_reports
  
  // Image details
  imageType: String, // 'xray', 'mri', 'ct', 'ultrasound', 'ecg'
  bodyPart: String,
  studyDate: Date,
  modality: String,
  
  // File information
  originalFileName: String,
  storagePath: String,
  thumbnailPath: String,
  fileSize: Number,
  dimensions: {
    width: Number,
    height: Number
  },
  
  // DICOM metadata (if applicable)
  dicomData: {
    studyInstanceUID: String,
    seriesInstanceUID: String,
    sopInstanceUID: String,
    patientPosition: String,
    acquisitionParameters: Object
  },
  
  // AI analysis results
  aiAnalysis: {
    analysisDate: Date,
    findings: [{
      finding: String,
      confidence: Number,
      location: {
        coordinates: [Number], // [x, y, width, height]
        description: String
      }
    }],
    normalityScore: Number, // 0-100
    recommendations: [String]
  },
  
  // Radiologist review
  radiologyReport: {
    radiologistId: String,
    reportDate: Date,
    findings: String,
    impression: String,
    recommendations: String,
    urgency: String // 'routine', 'urgent', 'critical'
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
db.medical_images.createIndex({ "patientId": 1 })
db.medical_images.createIndex({ "imageType": 1 })
db.medical_images.createIndex({ "studyDate": -1 })
db.medical_images.createIndex({ "reportId": 1 })
```

---

## Database Configuration

### Connection Settings
```javascript
// MongoDB connection configuration
const mongoConfig = {
  uri: "mongodb://localhost:27017/clinical_appointment_system",
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
}
```

### Security and Access Control
```javascript
// Role-based access control
db.createUser({
  user: "medical_app",
  pwd: "secure_password",
  roles: [
    { role: "readWrite", db: "clinical_appointment_system" }
  ]
})

// Collection-level security
db.runCommand({
  collMod: "medical_reports",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["patientId", "fileName", "fileType", "uploadDate"],
      properties: {
        patientId: { bsonType: "string" },
        fileName: { bsonType: "string" },
        fileType: { enum: ["blood", "urine", "xray", "mri", "other"] },
        uploadDate: { bsonType: "date" }
      }
    }
  }
})
```

### Backup and Maintenance
```bash
# Daily backup script
mongodump --db clinical_appointment_system --out /backup/mongodb/$(date +%Y%m%d)

# Index maintenance
db.medical_reports.reIndex()
db.health_metrics.reIndex()
```

---

## Performance Optimization

### Aggregation Pipelines
```javascript
// Patient health summary aggregation
db.health_metrics.aggregate([
  { $match: { patientId: "P001" } },
  { $unwind: "$metrics" },
  { $sort: { "metrics.date": -1 } },
  { $limit: 10 },
  { $group: {
    _id: "$patientId",
    latestMetrics: { $first: "$metrics" },
    avgBloodPressure: { $avg: "$metrics.bloodPressure.systolic" }
  }}
])

// AI prediction trend analysis
db.ai_predictions.aggregate([
  { $match: { 
    predictionType: "diabetes_risk", 
    analysisDate: { $gte: new Date("2024-01-01") }
  }},
  { $group: {
    _id: { 
      month: { $month: "$analysisDate" },
      riskLevel: "$prediction.riskLevel"
    },
    count: { $sum: 1 }
  }},
  { $sort: { "_id.month": 1 } }
])
```

### Data Archival Strategy
```javascript
// Archive old medical reports (older than 7 years)
const archiveDate = new Date();
archiveDate.setFullYear(archiveDate.getFullYear() - 7);

db.medical_reports.updateMany(
  { uploadDate: { $lt: archiveDate } },
  { $set: { status: "archived", archivedDate: new Date() } }
)
```

This MongoDB schema provides a robust foundation for storing complex medical data, AI predictions, and health metrics while maintaining flexibility for future enhancements and ensuring optimal performance for the Clinical Appointment Scheduling System.
