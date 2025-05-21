
import { BaseService, TableName } from "../base/base.service";
import { Patient } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";

// Define appointment interface to properly type the response
interface AppointmentWithPatientId {
  patient_id: string;
}

class PatientService extends BaseService<Patient> {
  constructor() {
    super('patients' as TableName);
  }

  async getPatientsWithDetails(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select(`
        *,
        profile:id (first_name, last_name, email)
      `);
    
    if (error) {
      console.error('Error fetching patients with details:', error);
      throw error;
    }
    
    return data as unknown as Patient[];
  }

  async getPatientById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select(`
        *,
        profile:id (first_name, last_name, email, created_at)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching patient by ID:', error);
      return null;
    }
    
    return data as unknown as Patient;
  }

  async getPatientsByDoctor(doctorId: string): Promise<Patient[]> {
    // Récupérer d'abord les rendez-vous du médecin
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from('appointments' as any)
      .select('patient_id')
      .eq('doctor_id', doctorId)
      .order('date', { ascending: false });
    
    if (appointmentsError) {
      console.error('Error fetching appointments by doctor:', appointmentsError);
      throw appointmentsError;
    }
    
    // Type check to ensure the data is available and cast properly
    if (!appointmentsData) {
      return [];
    }
    
    // First convert to unknown, then cast to our expected type to avoid TS errors
    const typedAppointmentsData = appointmentsData as unknown as AppointmentWithPatientId[];
    
    // Extract unique patient IDs
    const uniquePatientIds = [...new Set(typedAppointmentsData.map(app => app.patient_id))];
    
    if (uniquePatientIds.length === 0) {
      return [];
    }
    
    // Retrieve patient details
    const { data: patientsData, error: patientsError } = await supabase
      .from(this.tableName as any)
      .select(`
        *,
        profile:id (first_name, last_name, email)
      `)
      .in('id', uniquePatientIds);
    
    if (patientsError) {
      console.error('Error fetching patients details:', patientsError);
      throw patientsError;
    }
    
    return patientsData as unknown as Patient[];
  }
}

export const patientService = new PatientService();
