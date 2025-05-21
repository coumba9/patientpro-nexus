
import { BaseService, TableName } from "../base/base.service";
import { Patient } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";

class PatientService extends BaseService<Patient> {
  constructor() {
    super('patients' as TableName);
  }

  async getPatientsWithProfiles(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select(`
        *,
        profile:id (first_name, last_name, email, phone)
      `);
    
    if (error) {
      console.error('Error fetching patients with profiles:', error);
      throw error;
    }
    
    return data as Patient[];
  }

  async getPatientsByDoctor(doctorId: string): Promise<Patient[]> {
    // Cette requête supposera une table de relation doctor_patients
    // ou utilisera les rendez-vous pour déterminer les patients d'un médecin
    const { data, error } = await supabase
      .from('appointments' as any)
      .select(`
        patient_id,
        patient:patient_id (
          *,
          profile:id (first_name, last_name, email, phone)
        )
      `)
      .eq('doctor_id', doctorId)
      .limit(100);
    
    if (error) {
      console.error('Error fetching patients by doctor:', error);
      throw error;
    }
    
    // Extraire les données de patient uniques
    const uniquePatients = data
      .map(item => item.patient)
      .filter((patient, index, self) => 
        index === self.findIndex(p => p.id === patient.id)
      );
    
    return uniquePatients as Patient[];
  }
}

export const patientService = new PatientService();
