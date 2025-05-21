
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
    
    // Safely access data properties with type assertion
    return data as unknown as Patient;
  }
}

export const patientService = new PatientService();
