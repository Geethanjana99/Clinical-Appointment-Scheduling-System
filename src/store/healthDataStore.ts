import { create } from 'zustand';
interface HealthMetric {
  date: string;
  bloodPressure: number;
  sugarLevel: number;
}
interface PatientHealthData {
  patientId: string;
  patientName: string;
  metrics: HealthMetric[];
}
interface HealthDataState {
  healthData: PatientHealthData[];
  getPatientHealthData: (patientId: string) => PatientHealthData | null;
}
// Mock data generator
const generateMockHealthData = (): PatientHealthData[] => {
  const patients = [{
    id: 'P001',
    name: 'John Smith'
  }, {
    id: 'P002',
    name: 'Emily Davis'
  }, {
    id: 'P003',
    name: 'Michael Brown'
  }];
  return patients.map(patient => {
    const metrics: HealthMetric[] = Array.from({
      length: 10
    }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i * 7); // Weekly readings
      return {
        date: date.toISOString(),
        bloodPressure: 120 + Math.floor(Math.random() * 20),
        sugarLevel: 100 + Math.floor(Math.random() * 40)
      };
    });
    return {
      patientId: patient.id,
      patientName: patient.name,
      metrics: metrics.reverse() // Show oldest to newest
    };
  });
};
export const useHealthDataStore = create<HealthDataState>((set, get) => ({
  healthData: generateMockHealthData(),
  getPatientHealthData: (patientId: string) => {
    return get().healthData.find(data => data.patientId === patientId) || null;
  }
}));