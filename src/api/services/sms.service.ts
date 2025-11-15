import { supabase } from "@/integrations/supabase/client";

export interface SendSMSRequest {
  phoneNumber: string;
  message: string;
  userId: string;
  signature?: string;
}

export interface SendSMSResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export interface SMSLog {
  id: string;
  user_id: string;
  phone_number: string;
  message: string;
  status: string;
  provider_response: any;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

class SMSService {
  /**
   * Send an SMS message
   */
  async sendSMS(request: SendSMSRequest): Promise<SendSMSResponse> {
    try {
      console.log('Sending SMS:', request);

      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: request
      });

      if (error) {
        console.error('Error sending SMS:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return data as SendSMSResponse;
    } catch (error: any) {
      console.error('SMS service error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      };
    }
  }

  /**
   * Get SMS logs for a user
   */
  async getUserSMSLogs(userId: string): Promise<SMSLog[]> {
    try {
      const { data, error } = await supabase
        .from('sms_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching SMS logs:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserSMSLogs:', error);
      throw error;
    }
  }

  /**
   * Get all SMS logs (admin only)
   */
  async getAllSMSLogs(limit: number = 100): Promise<SMSLog[]> {
    try {
      const { data, error } = await supabase
        .from('sms_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching all SMS logs:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllSMSLogs:', error);
      throw error;
    }
  }

  /**
   * Send appointment reminder SMS
   */
  async sendAppointmentReminder(
    patientId: string,
    phoneNumber: string,
    appointmentDate: string,
    appointmentTime: string,
    appointmentType: string,
    patientName?: string
  ): Promise<SendSMSResponse> {
    const message = `Bonjour${patientName ? ' ' + patientName : ''}, rappel: rendez-vous ${appointmentType} le ${new Date(appointmentDate).toLocaleDateString('fr-FR')} à ${appointmentTime}. JàmmSanté`;

    return this.sendSMS({
      phoneNumber,
      message,
      userId: patientId,
      signature: 'JàmmSanté'
    });
  }

  /**
   * Send appointment confirmation SMS
   */
  async sendAppointmentConfirmation(
    patientId: string,
    phoneNumber: string,
    appointmentDate: string,
    appointmentTime: string,
    doctorName: string
  ): Promise<SendSMSResponse> {
    const message = `Votre rendez-vous avec Dr ${doctorName} a été confirmé pour le ${new Date(appointmentDate).toLocaleDateString('fr-FR')} à ${appointmentTime}. JàmmSanté`;

    return this.sendSMS({
      phoneNumber,
      message,
      userId: patientId,
      signature: 'JàmmSanté'
    });
  }

  /**
   * Send appointment cancellation SMS
   */
  async sendAppointmentCancellation(
    patientId: string,
    phoneNumber: string,
    appointmentDate: string,
    appointmentTime: string,
    reason?: string
  ): Promise<SendSMSResponse> {
    const message = `Votre rendez-vous du ${new Date(appointmentDate).toLocaleDateString('fr-FR')} à ${appointmentTime} a été annulé${reason ? ': ' + reason : ''}. JàmmSanté`;

    return this.sendSMS({
      phoneNumber,
      message,
      userId: patientId,
      signature: 'JàmmSanté'
    });
  }
}

export const smsService = new SMSService();
