
import { BaseService, TableName } from "../base/base.service";
import { ModerationReport } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";

class ModerationService extends BaseService<ModerationReport> {
  constructor() {
    super('moderation_reports' as TableName);
  }

  async getReports(status?: string): Promise<ModerationReport[]> {
    let query = supabase
      .from(this.tableName as any)
      .select(`
        *,
        reporter:reporter_id (first_name, last_name, email),
        reported:reported_id (first_name, last_name, email),
        resolver:resolved_by (first_name, last_name, email)
      `);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching moderation reports:', error);
      throw error;
    }
    
    return data as unknown as ModerationReport[];
  }

  async createReport(report: Omit<ModerationReport, 'id' | 'created_at' | 'updated_at'>): Promise<ModerationReport> {
    return this.create(report);
  }

  async updateReportStatus(id: string, status: string, resolvedBy?: string): Promise<ModerationReport> {
    const updateData: any = { status };
    
    if (status === 'resolved' || status === 'rejected') {
      updateData.resolved_at = new Date().toISOString();
      if (resolvedBy) {
        updateData.resolved_by = resolvedBy;
      }
    }
    
    return this.update(id, updateData);
  }

  async getPendingReportsCount(): Promise<number> {
    const { count, error } = await supabase
      .from(this.tableName as any)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    if (error) {
      console.error('Error counting pending reports:', error);
      throw error;
    }
    
    return count || 0;
  }
}

export const moderationService = new ModerationService();
