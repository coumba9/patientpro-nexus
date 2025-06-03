
import { BaseService, TableName } from "../base/base.service";
import { AdminMetric } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";

class AdminMetricsService extends BaseService<AdminMetric> {
  constructor() {
    super('admin_metrics' as TableName);
  }

  async getMetricsByCategory(category: string): Promise<AdminMetric[]> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select('*')
      .eq('category', category);
    
    if (error) {
      console.error(`Error fetching metrics for category ${category}:`, error);
      throw error;
    }
    
    return data as unknown as AdminMetric[];
  }

  async updateMetric(id: string, value: number): Promise<AdminMetric> {
    // Utiliser seulement la valeur, pas updated_at car c'est exclu du type
    return this.update(id, { value });
  }

  async createOrUpdateMetric(name: string, value: number, category: string, period: string): Promise<AdminMetric> {
    // Vérifier si la métrique existe déjà
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select('*')
      .eq('name', name)
      .eq('category', category)
      .eq('period', period)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking for existing metric:', error);
      throw error;
    }
    
    if (data) {
      // Mettre à jour la métrique existante - utiliser seulement value
      return this.update((data as any).id, { value });
    } else {
      // Créer une nouvelle métrique
      return this.create({ name, value, category, period });
    }
  }
}

export const adminMetricsService = new AdminMetricsService();
