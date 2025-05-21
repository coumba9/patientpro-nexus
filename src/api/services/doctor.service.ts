
import { BaseService, TableName } from "../base/base.service";
import { Doctor } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";

class DoctorService extends BaseService<Doctor> {
  constructor() {
    super('doctors' as TableName);
  }

  async getDoctorsWithDetails(): Promise<Doctor[]> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select(`
        *,
        specialty:specialty_id (id, name),
        profile:id (first_name, last_name, email)
      `);
    
    if (error) {
      console.error('Error fetching doctors with details:', error);
      throw error;
    }
    
    return data as unknown as Doctor[];
  }

  async getDoctorsBySpecialty(specialtyId: string): Promise<Doctor[]> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select(`
        *,
        profile:id (first_name, last_name, email)
      `)
      .eq('specialty_id', specialtyId);
    
    if (error) {
      console.error('Error fetching doctors by specialty:', error);
      throw error;
    }
    
    return data as unknown as Doctor[];
  }

  async verifyDoctor(id: string, verified: boolean): Promise<Doctor> {
    return this.update(id, { is_verified: verified });
  }

  async getDoctorById(id: string): Promise<Doctor | null> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select(`
        *,
        specialty:specialty_id (id, name),
        profile:id (first_name, last_name, email)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching doctor by ID:', error);
      return null;
    }
    
    return data as unknown as Doctor;
  }
}

export const doctorService = new DoctorService();
