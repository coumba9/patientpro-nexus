
import { BaseService, TableName } from "../base/base.service";
import { Appointment, CancellationRequest } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";

class AppointmentService extends BaseService<Appointment> {
  constructor() {
    super('appointments' as TableName);
  }

  async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select(`
        *,
        patient:patient_id (
          id,
          profile:id (first_name, last_name, email)
        )
      `)
      .eq('doctor_id', doctorId)
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    
    if (error) {
      console.error('Error fetching appointments by doctor:', error);
      throw error;
    }
    
    return data as unknown as Appointment[];
  }

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select(`
        *,
        doctor:doctor_id (
          id,
          profile:id (first_name, last_name),
          specialty:specialty_id (name)
        )
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    
    if (error) {
      console.error('Error fetching appointments by patient:', error);
      throw error;
    }
    
    return data as unknown as Appointment[];
  }

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    return this.update(id, { status });
  }

  async cancelAppointment(cancellationRequest: CancellationRequest): Promise<Appointment> {
    const { data, error } = await supabase
      .from(this.tableName as any)
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: cancellationRequest.cancelled_by,
        cancellation_reason: cancellationRequest.reason,
        cancellation_type: cancellationRequest.cancellation_type
      })
      .eq('id', cancellationRequest.appointment_id)
      .select()
      .single();
    
    if (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
    
    return data as unknown as Appointment;
  }

  async getUpcomingAppointments(userId: string, userRole: 'doctor' | 'patient'): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    const fieldName = userRole === 'doctor' ? 'doctor_id' : 'patient_id';
    
    const { data, error } = await supabase
      .from(this.tableName as any)
      .select(`
        *,
        doctor:doctor_id (
          id, 
          profile:id (first_name, last_name)
        ),
        patient:patient_id (
          id,
          profile:id (first_name, last_name)
        )
      `)
      .eq(fieldName, userId)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    
    if (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw error;
    }
    
    return data as unknown as Appointment[];
  }
}

export const appointmentService = new AppointmentService();
