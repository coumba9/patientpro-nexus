
import { BaseService, TableName } from "../base/base.service";
import { UserProfile } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";

class ProfileService extends BaseService<UserProfile> {
  constructor() {
    super('profiles' as TableName);
  }

  async getProfileById(id: string): Promise<UserProfile | null> {
    return this.getById(id);
  }

  async updateProfile(id: string, profile: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>): Promise<UserProfile> {
    return this.update(id, profile);
  }

  async getProfilesByRole(role: 'doctor' | 'patient' | 'admin'): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select('*')
      .eq('role', role);
    
    if (error) {
      console.error(`Error fetching profiles with role ${role}:`, error);
      throw error;
    }
    
    return data as unknown as UserProfile[];
  }

  async searchProfiles(query: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`);
    
    if (error) {
      console.error('Error searching profiles:', error);
      throw error;
    }
    
    return data as unknown as UserProfile[];
  }
}

export const profileService = new ProfileService();
