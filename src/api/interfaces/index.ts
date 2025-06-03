
// Définition des types communs pour l'API

export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Doctor extends BaseEntity {
  license_number: string;
  specialty_id?: string;
  years_of_experience?: number;
  is_verified?: boolean;
  // Relations
  specialty?: Specialty;
  profile?: UserProfile;
}

export interface Patient extends BaseEntity {
  medical_record_id?: string;
  birth_date?: string;
  gender?: string;
  blood_type?: string;
  allergies?: string[];
  // Relations
  profile?: UserProfile;
}

export interface UserProfile extends BaseEntity {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role: 'doctor' | 'patient' | 'admin';
}

export interface Specialty extends BaseEntity {
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  total_doctors?: number;
}

export interface Appointment extends BaseEntity {
  doctor_id: string;
  patient_id: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  type: 'consultation' | 'follow_up' | 'emergency';
  mode: 'in_person' | 'teleconsultation';
  location?: string;
  notes?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  cancellation_type?: 'doctor' | 'patient';
}

export interface CancellationPolicy extends BaseEntity {
  user_type: 'doctor' | 'patient';
  minimum_hours_before: number;
}

export interface CancellationRequest {
  appointment_id: string;
  reason: string;
  cancelled_by: string;
  cancellation_type: 'doctor' | 'patient';
}

export interface MedicalRecord extends BaseEntity {
  patient_id: string;
  doctor_id: string;
  diagnosis: string;
  prescription?: string;
  notes?: string;
  date: string;
}

export interface Note extends BaseEntity {
  patient_id: string;
  doctor_id: string;
  title: string;
  content: string;
  date: string;
}

export interface ModerationReport extends BaseEntity {
  reporter_id?: string;
  reported_id?: string;
  reason: string;
  details?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'rejected';
  resolved_by?: string;
  resolved_at?: string;
  reporter?: Pick<UserProfile, 'first_name' | 'last_name' | 'email'>;
  reported?: Pick<UserProfile, 'first_name' | 'last_name' | 'email'>;
  resolver?: Pick<UserProfile, 'first_name' | 'last_name' | 'email'>;
}

export interface AdminMetric extends BaseEntity {
  name: string;
  value: number;
  category: string;
  period: string;
}
