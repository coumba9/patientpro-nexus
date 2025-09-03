
import { supabase } from "@/integrations/supabase/client";

// Use distinct names to avoid conflicts with interfaces
interface NotificationServiceData {
  id: string;
  type: "cancellation" | "reminder" | "queue" | "appointment";
  title: string;
  message: string;
  user_id: string;
  appointment_id?: string;
  priority: "high" | "medium" | "low";
  is_read: boolean;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

interface ReminderServiceData {
  id: string;
  appointment_id: string;
  patient_id: string;
  reminder_type: "24h" | "2h" | "manual";
  method: "phone" | "sms" | "email";
  scheduled_for: string;
  status: "pending" | "completed" | "failed";
  attempts: number;
  created_at?: string;
  updated_at?: string;
}

interface QueueEntryServiceData {
  id: string;
  patient_id: string;
  requested_doctor_id?: string;
  specialty_id?: string;
  urgency: "urgent" | "normal" | "flexible";
  preferred_dates?: string[];
  notes?: string;
  status: "waiting" | "assigned" | "cancelled";
  created_at?: string;
  updated_at?: string;
}

class NotificationService {
  async createNotification(notification: Omit<NotificationServiceData, 'id' | 'created_at' | 'updated_at'>): Promise<NotificationServiceData> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
    
    return data as NotificationServiceData;
  }

  async getNotificationsByUser(userId: string): Promise<NotificationServiceData[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
    
    return data as NotificationServiceData[];
  }

  async markAsRead(notificationId: string): Promise<NotificationServiceData> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();
    
    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
    
    return data as NotificationServiceData;
  }

  async createReminder(reminder: Omit<ReminderServiceData, 'id' | 'created_at' | 'updated_at'>): Promise<ReminderServiceData> {
    const { data, error } = await supabase
      .from('reminders')
      .insert(reminder)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
    
    return data as ReminderServiceData;
  }

  async getRemindersByDate(date: string): Promise<ReminderServiceData[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .gte('scheduled_for', `${date} 00:00:00`)
      .lt('scheduled_for', `${date} 23:59:59`)
      .order('scheduled_for', { ascending: true });
    
    if (error) {
      console.error('Error fetching reminders:', error);
      throw error;
    }
    
    return data as ReminderServiceData[];
  }

  async updateReminderStatus(reminderId: string, status: ReminderServiceData['status'], attempts?: number): Promise<ReminderServiceData> {
    const updateData: any = { status };
    if (attempts !== undefined) {
      updateData.attempts = attempts;
    }

    const { data, error } = await supabase
      .from('reminders')
      .update(updateData)
      .eq('id', reminderId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating reminder status:', error);
      throw error;
    }
    
    return data as ReminderServiceData;
  }

  async createQueueEntry(entry: Omit<QueueEntryServiceData, 'id' | 'created_at' | 'updated_at'>): Promise<QueueEntryServiceData> {
    const { data, error } = await supabase
      .from('queue_entries')
      .insert(entry)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating queue entry:', error);
      throw error;
    }
    
    return data as QueueEntryServiceData;
  }

  async getQueueEntries(): Promise<QueueEntryServiceData[]> {
    const { data, error } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching queue entries:', error);
      throw error;
    }
    
    return data as QueueEntryServiceData[];
  }

  async updateQueueEntryStatus(entryId: string, status: QueueEntryServiceData['status']): Promise<QueueEntryServiceData> {
    const { data, error } = await supabase
      .from('queue_entries')
      .update({ status })
      .eq('id', entryId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating queue entry status:', error);
      throw error;
    }
    
    return data as QueueEntryServiceData;
  }

  async sendAppointmentCancellationNotification(appointmentId: string, cancelledBy: string): Promise<void> {
    try {
      // Récupérer les détails du rendez-vous
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (appointmentError || !appointment) {
        console.error('Error fetching appointment for notification:', appointmentError);
        return;
      }

      // Récupérer les informations du médecin
      const { data: doctorProfile, error: doctorError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', appointment.doctor_id)
        .single();

      // Récupérer les informations du patient
      const { data: patientProfile, error: patientError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', appointment.patient_id)
        .single();

      const notificationPromises = [];

      if (cancelledBy !== appointment.doctor_id && doctorProfile && !doctorError) {
        // Notifier le médecin
        notificationPromises.push(
          this.createNotification({
            type: "cancellation",
            title: "Rendez-vous annulé",
            message: `Le patient ${patientProfile?.first_name || ''} ${patientProfile?.last_name || ''} a annulé son rendez-vous du ${appointment.date}`,
            user_id: appointment.doctor_id,
            appointment_id: appointmentId,
            priority: "high",
            is_read: false
          })
        );
      }

      if (cancelledBy !== appointment.patient_id && patientProfile && !patientError) {
        // Notifier le patient
        notificationPromises.push(
          this.createNotification({
            type: "cancellation",
            title: "Rendez-vous annulé",
            message: `Dr. ${doctorProfile?.first_name || ''} ${doctorProfile?.last_name || ''} a annulé votre rendez-vous du ${appointment.date}`,
            user_id: appointment.patient_id,
            appointment_id: appointmentId,
            priority: "high",
            is_read: false
          })
        );
      }

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Error sending cancellation notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();
// Export with different names to avoid conflicts
export type { 
  NotificationServiceData as NotificationData, 
  ReminderServiceData as ReminderData, 
  QueueEntryServiceData as QueueEntryData 
};
