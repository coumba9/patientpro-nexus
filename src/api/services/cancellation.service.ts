
import { BaseService, TableName } from "../base/base.service";
import { CancellationPolicy } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";

class CancellationService extends BaseService<CancellationPolicy> {
  constructor() {
    super('cancellation_policies' as any);
  }

  async getCancellationPolicy(userType: 'doctor' | 'patient'): Promise<CancellationPolicy | null> {
    const { data, error } = await supabase
      .from('cancellation_policies')
      .select('*')
      .eq('user_type', userType)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching cancellation policy:', error);
      throw error;
    }
    
    return data as unknown as CancellationPolicy;
  }

  async canCancelAppointment(
    appointmentId: string, 
    userId: string, 
    userRole: 'doctor' | 'patient'
  ): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('can_cancel_appointment', {
        appointment_id: appointmentId,
        user_id: userId,
        user_role: userRole
      });
    
    if (error) {
      console.error('Error checking cancellation permission:', error);
      throw error;
    }
    
    return data as boolean;
  }

  async updateCancellationPolicy(
    userType: 'doctor' | 'patient', 
    minimumHoursBefore: number
  ): Promise<CancellationPolicy> {
    const { data, error } = await supabase
      .from('cancellation_policies')
      .update({ minimum_hours_before: minimumHoursBefore })
      .eq('user_type', userType)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating cancellation policy:', error);
      throw error;
    }
    
    return data as unknown as CancellationPolicy;
  }
}

export const cancellationService = new CancellationService();
