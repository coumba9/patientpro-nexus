
import { BaseService, TableName } from "../base/base.service";
import { MedicalRecord } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";

class MedicalRecordService extends BaseService<MedicalRecord> {
  constructor() {
    super('medical_records' as TableName);
  }

  async getRecordsByPatient(patientId: string): Promise<MedicalRecord[]> {
    const { data, error } = await supabase
      .from(this.tableName as any)
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
    
    const records = (data as any[]) || [];
    const enriched = await Promise.all(records.map(async (record: any) => {
      if (!record.doctor || !record.doctor.profile) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', record.doctor_id)
          .maybeSingle();
        return {
          ...record,
          doctor: {
            ...(record.doctor || {}),
            profile: prof || null,
          },
        };
      }
      return record;
    }));
    
    return enriched as unknown as MedicalRecord[];
  }

  async addMedicalRecord(record: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>): Promise<MedicalRecord> {
    return this.create(record);
  }
}

export const medicalRecordService = new MedicalRecordService();
