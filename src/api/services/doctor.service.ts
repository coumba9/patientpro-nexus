
import { BaseService, TableName } from "../base/base.service";
import { Doctor } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";

class DoctorService extends BaseService<Doctor> {
  constructor() {
    super('doctors' as TableName);
  }

  async getDoctorsWithDetails(): Promise<Doctor[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        specialty:specialty_id (id, name),
        profile:id (first_name, last_name, email)
      `);
    
    if (error) {
      console.error('Error fetching doctors with details:', error);
      throw error;
    }
    
    return data as Doctor[];
  }

  async getDoctorsBySpecialty(specialtyId: string): Promise<Doctor[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        profile:id (first_name, last_name, email)
      `)
      .eq('specialty_id', specialtyId);
    
    if (error) {
      console.error('Error fetching doctors by specialty:', error);
      throw error;
    }
    
    return data as Doctor[];
  }

  async verifyDoctor(id: string, verified: boolean): Promise<Doctor> {
    return this.update(id, { is_verified: verified });
  }
}

export const doctorService = new DoctorService();
