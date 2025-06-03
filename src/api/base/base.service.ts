
import { supabase } from "@/integrations/supabase/client";
import { BaseEntity } from "../interfaces";
import { PostgrestResponse } from '@supabase/supabase-js';

// Define the table names based on what's available in the Supabase types
export type TableName = 'doctors' | 'specialties' | 'profiles' | 'medical_records' | 'appointments' | 'patients' | 'notes' | 'admin_metrics' | 'moderation_reports';

export abstract class BaseService<T extends BaseEntity> {
  protected tableName: TableName;

  constructor(tableName: TableName) {
    this.tableName = tableName;
  }

  async getAll(): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select('*');
    
    if (error) {
      console.error(`Error fetching ${this.tableName}:`, error);
      throw error;
    }
    
    return data as unknown as T[];
  }

  async getById(id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error(`Error fetching ${this.tableName} by id:`, error);
      throw error;
    }
    
    return data as unknown as T;
  }

  async create(entity: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .insert(entity as any)
      .select()
      .single();
    
    if (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }
    
    return data as unknown as T;
  }

  async update(id: string, entity: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .update(entity as any)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }
    
    return data as unknown as T;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName as any)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw error;
    }
  }

  async count(): Promise<number> {
    const { count, error } = await supabase
      .from(this.tableName as any)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`Error counting ${this.tableName}:`, error);
      throw error;
    }
    
    return count || 0;
  }
}
