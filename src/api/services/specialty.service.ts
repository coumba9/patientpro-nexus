
import { BaseService } from "../base/base.service";
import { Specialty } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";

class SpecialtyService extends BaseService<Specialty> {
  constructor() {
    super('specialties');
  }

  async getActiveSpecialties(): Promise<Specialty[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('status', 'active');
    
    if (error) {
      console.error('Error fetching active specialties:', error);
      throw error;
    }
    
    return data as Specialty[];
  }

  async getSpecialtyWithDoctorsCount(): Promise<Specialty[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*, total_doctors');
    
    if (error) {
      console.error('Error fetching specialties with doctors count:', error);
      throw error;
    }
    
    return data as Specialty[];
  }
}

export const specialtyService = new SpecialtyService();
