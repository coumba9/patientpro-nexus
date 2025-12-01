
import { BaseService, TableName } from "../base/base.service";
import { Patient } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";

class PatientService extends BaseService<Patient> {
  constructor() {
    super('patients' as TableName);
  }

  async getPatientsWithDetails(): Promise<Patient[]> {
    // First get all patients
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*');
    
    if (patientsError) {
      console.error('Error fetching patients:', patientsError);
      throw patientsError;
    }

    if (!patients || patients.length === 0) {
      return [];
    }

    // Get profiles for these patients
    const patientIds = patients.map(p => p.id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone_number')
      .in('id', patientIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    // Merge data
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));
    
    return patients.map(patient => ({
      ...patient,
      profile: profileMap.get(patient.id) || null
    })) as unknown as Patient[];
  }

  async getPatientById(id: string): Promise<Patient | null> {
    // Get patient data
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (patientError) {
      console.error('Error fetching patient by ID:', patientError);
      return null;
    }

    if (!patient) {
      return null;
    }

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, phone_number, created_at')
      .eq('id', id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }
    
    return {
      ...patient,
      profile: profile || null
    } as unknown as Patient;
  }

  async getPatientsByDoctor(doctorId: string): Promise<Patient[]> {
    // Get all completed appointments for this doctor
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('patient_id, date')
      .eq('doctor_id', doctorId)
      .in('status', ['completed', 'confirmed'])
      .order('date', { ascending: false });
    
    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      throw appointmentsError;
    }
    
    if (!appointments || appointments.length === 0) {
      return [];
    }
    
    // Get unique patient IDs with their last visit date
    const patientVisits = new Map<string, string>();
    appointments.forEach((apt: any) => {
      if (!patientVisits.has(apt.patient_id)) {
        patientVisits.set(apt.patient_id, apt.date);
      }
    });
    
    const uniquePatientIds = Array.from(patientVisits.keys());
    
    // Fetch patient details
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .in('id', uniquePatientIds);
    
    if (patientsError) {
      console.error('Error fetching patients:', patientsError);
      throw patientsError;
    }

    if (!patients || patients.length === 0) {
      return [];
    }

    // Fetch profiles for these patients
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone_number')
      .in('id', uniquePatientIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    // Create profile map
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));
    
    // Merge data with last visit
    return patients.map(patient => ({
      ...patient,
      profile: profileMap.get(patient.id) || null,
      lastVisit: patientVisits.get(patient.id) || null
    })) as unknown as Patient[];
  }
}

export const patientService = new PatientService();
