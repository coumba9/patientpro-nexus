
import { supabase } from "@/integrations/supabase/client";
import { BaseEntity } from "../interfaces";

export abstract class BaseService<T extends BaseEntity> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async getAll(): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*');
    
    if (error) {
      console.error(`Error fetching ${this.tableName}:`, error);
      throw error;
    }
    
    return data as T[];
  }

  async getById(id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error(`Error fetching ${this.tableName} by id:`, error);
      throw error;
    }
    
    return data as T;
  }

  async create(entity: Omit<T, 'id'>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(entity)
      .select()
      .single();
    
    if (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }
    
    return data as T;
  }

  async update(id: string, entity: Partial<T>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(entity)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }
    
    return data as T;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw error;
    }
  }

  async count(): Promise<number> {
    const { count, error } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`Error counting ${this.tableName}:`, error);
      throw error;
    }
    
    return count || 0;
  }
}
