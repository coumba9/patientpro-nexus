
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

  async setUserRole(userId: string, role: 'doctor' | 'patient' | 'admin'): Promise<UserProfile> {
    return this.update(userId, { role });
  }

  async countByRole(role: 'doctor' | 'patient' | 'admin'): Promise<number> {
    const { count, error } = await supabase
      .from(this.tableName as any)
      .select('*', { count: 'exact', head: true })
      .eq('role', role);
    
    if (error) {
      console.error(`Error counting profiles with role ${role}:`, error);
      throw error;
    }
    
    return count || 0;
  }
  
  async getActiveProfiles(): Promise<UserProfile[]> {
    // Dans une implémentation réelle, vous pourriez avoir une colonne status
    // Ici nous renvoyons simplement tous les profils comme exemple
    return this.getAll();
  }
  
  async getBlockedProfiles(): Promise<UserProfile[]> {
    // Dans une implémentation réelle, vous auriez une colonne status
    // Pour l'exemple, nous renvoyons un tableau vide
    return [];
  }

  async getPendingProfiles(): Promise<UserProfile[]> {
    // Pour les médecins en attente de vérification
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        id,
        profile:id (*)
      `)
      .eq('is_verified', false);
    
    if (error) {
      console.error('Error fetching pending doctor profiles:', error);
      throw error;
    }
    
    // Extraire les profils de la réponse
    return data.map((item: any) => item.profile) as unknown as UserProfile[];
  }
}

export const profileService = new ProfileService();
