
import { supabase } from "@/integrations/supabase/client";

interface NotificationData {
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

interface ReminderData {
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

interface QueueEntryData {
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
  async createNotification(notification: Omit<NotificationData, 'id' | 'created_at' | 'updated_at'>): Promise<NotificationData> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
    
    return data as NotificationData;
  }

  async getNotificationsByUser(userId: string): Promise<NotificationData[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
    
    return data as NotificationData[];
  }

  async markAsRead(notificationId: string): Promise<NotificationData> {
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
    
    return data as NotificationData;
  }

  async createReminder(reminder: Omit<ReminderData, 'id' | 'created_at' | 'updated_at'>): Promise<ReminderData> {
    const { data, error } = await supabase
      .from('reminders')
      .insert(reminder)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
    
    return data as ReminderData;
  }

  async getRemindersByDate(date: string): Promise<ReminderData[]> {
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
    
    return data as ReminderData[];
  }

  async updateReminderStatus(reminderId: string, status: ReminderData['status'], attempts?: number): Promise<ReminderData> {
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
    
    return data as ReminderData;
  }

  async createQueueEntry(entry: Omit<QueueEntryData, 'id' | 'created_at' | 'updated_at'>): Promise<QueueEntryData> {
    const { data, error } = await supabase
      .from('queue_entries')
      .insert(entry)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating queue entry:', error);
      throw error;
    }
    
    return data as QueueEntryData;
  }

  async getQueueEntries(): Promise<QueueEntryData[]> {
    const { data, error } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching queue entries:', error);
      throw error;
    }
    
    return data as QueueEntryData[];
  }

  async updateQueueEntryStatus(entryId: string, status: QueueEntryData['status']): Promise<QueueEntryData> {
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
    
    return data as QueueEntryData;
  }

  async sendAppointmentCancellationNotification(appointmentId: string, cancelledBy: string): Promise<void> {
    // Récupérer les détails du rendez-vous
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctor_id (profile:id (first_name, last_name)),
        patient:patient_id (profile:id (first_name, last_name))
      `)
      .eq('id', appointmentId)
      .single();

    if (error || !appointment) {
      console.error('Error fetching appointment for notification:', error);
      return;
    }

    // Créer des notifications pour les deux parties
    const notificationPromises = [];

    if (cancelledBy !== appointment.doctor_id) {
      // Notifier le médecin
      notificationPromises.push(
        this.createNotification({
          type: "cancellation",
          title: "Rendez-vous annulé",
          message: `Le patient ${appointment.patient.profile.first_name} ${appointment.patient.profile.last_name} a annulé son rendez-vous du ${appointment.date}`,
          user_id: appointment.doctor_id,
          appointment_id: appointmentId,
          priority: "high",
          is_read: false
        })
      );
    }

    if (cancelledBy !== appointment.patient_id) {
      // Notifier le patient
      notificationPromises.push(
        this.createNotification({
          type: "cancellation",
          title: "Rendez-vous annulé",
          message: `Dr. ${appointment.doctor.profile.first_name} ${appointment.doctor.profile.last_name} a annulé votre rendez-vous du ${appointment.date}`,
          user_id: appointment.patient_id,
          appointment_id: appointmentId,
          priority: "high",
          is_read: false
        })
      );
    }

    await Promise.all(notificationPromises);
  }
}

export const notificationService = new NotificationService();
export type { NotificationData, ReminderData, QueueEntryData };
