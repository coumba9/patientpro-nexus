
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
    // Logique temporaire - à remplacer par une vraie fonction RPC plus tard
    try {
      const { data: appointment, error } = await supabase
        .from('appointments')
        .select('date, time, doctor_id, patient_id')
        .eq('id', appointmentId)
        .single();
      
      if (error) throw error;
      
      // Vérifier si l'utilisateur est impliqué dans le rendez-vous
      const isInvolved = appointment.doctor_id === userId || appointment.patient_id === userId;
      if (!isInvolved) return false;
      
      // Règle : permettre l'annulation jusqu'à 24h avant (calcul robuste au fuseau)
      const datePart = String(appointment.date); // YYYY-MM-DD
      const timePart = String(appointment.time || '00:00:00'); // HH:MM:SS
      const [hhStr, mmStr = '0', ssStr = '0'] = timePart.split(':');
      const hh = Number(hhStr) || 0;
      const mm = Number(mmStr) || 0;
      const ss = Number(ssStr) || 0;
      // Construire la date locale du rendez-vous sans parsing ambigu
      const appointmentDate = new Date(datePart + 'T00:00:00');
      appointmentDate.setHours(hh, mm, ss, 0);
      
      const now = new Date();
      const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      return hoursUntilAppointment >= 24;
    } catch (error) {
      console.error('Error checking cancellation permission:', error);
      return false;
    }
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
