
import { BaseService, TableName } from "../base/base.service";
import { Patient } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";

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
    
    // Extraire les IDs uniques des patients
    const uniquePatientIds = [...new Set(appointmentsData.map(app => app.patient_id))];
    
    if (uniquePatientIds.length === 0) {
      return [];
    }
    
    // Récupérer les détails des patients
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
