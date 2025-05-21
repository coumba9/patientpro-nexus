
import { BaseService } from "../base/base.service";
import { MedicalRecord } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";

class MedicalRecordService extends BaseService<MedicalRecord> {
  constructor() {
    super('medical_records');
  }

  async getRecordsByPatient(patientId: string): Promise<MedicalRecord[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        doctor:doctor_id (
          id,
          profile:id (first_name, last_name)
        )
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching medical records by patient:', error);
      throw error;
    }
    
    return data as unknown as MedicalRecord[];
  }

  async addMedicalRecord(record: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>): Promise<MedicalRecord> {
    return this.create(record);
  }
}

export const medicalRecordService = new MedicalRecordService();
