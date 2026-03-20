
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
    // Get all completed/confirmed appointments for this doctor
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

    // Use get_safe_profile RPC to bypass RLS restrictions on profiles
    const profileResults = await Promise.all(
      uniquePatientIds.map(id =>
        supabase.rpc('get_safe_profile', { target_user_id: id }).single().then(r => ({ id, data: r.data, error: r.error }))
      )
    );

    // Also try to get patient medical data (may be limited by RLS)
    const { data: patients } = await supabase
      .from('patients')
      .select('*')
      .in('id', uniquePatientIds);

    const patientMap = new Map((patients || []).map(p => [p.id, p]));

    // Build results using profile data from RPC
    return uniquePatientIds.map(patientId => {
      const profileResult = profileResults.find(r => r.id === patientId);
      const profile = profileResult?.data || null;
      const patientData = patientMap.get(patientId);

      return {
        id: patientId,
        birth_date: patientData?.birth_date || null,
        blood_type: patientData?.blood_type || null,
        allergies: patientData?.allergies || null,
        gender: patientData?.gender || null,
        phone_number: profile?.phone_number || patientData?.phone_number || null,
        is_active: patientData?.is_active ?? true,
        created_at: patientData?.created_at || '',
        updated_at: patientData?.updated_at || '',
        profile: profile ? {
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          phone_number: profile.phone_number
        } : null,
        lastVisit: patientVisits.get(patientId) || null
      };
    }) as unknown as Patient[];
  }
}

export const patientService = new PatientService();
