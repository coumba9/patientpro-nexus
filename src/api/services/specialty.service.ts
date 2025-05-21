
import { BaseService, TableName } from "../base/base.service";
import { Specialty } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";

class SpecialtyService extends BaseService<Specialty> {
  constructor() {
    super('specialties' as TableName);
  }

  async getActiveSpecialties(): Promise<Specialty[]> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select('*')
      .eq('status', 'active');
    
    if (error) {
      console.error('Error fetching active specialties:', error);
      throw error;
    }
    
    return data as unknown as Specialty[];
  }

  async getSpecialtyWithDoctorsCount(): Promise<Specialty[]> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select('*, total_doctors');
    
    if (error) {
      console.error('Error fetching specialties with doctors count:', error);
      throw error;
    }
    
    return data as unknown as Specialty[];
  }
}

export const specialtyService = new SpecialtyService();
