
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
