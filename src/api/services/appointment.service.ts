
import { BaseService, TableName } from "../base/base.service";
import { Appointment, CancellationRequest } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";
import { validateAppointmentScheduling, hasAppointmentConflict, calculateConsultationFees } from "@/lib/businessLogic";

class AppointmentService extends BaseService<Appointment> {
  constructor() {
    super('appointments' as TableName);
  }

  async createAppointment(appointmentData: {
    doctor_id: string;
    patient_id: string;
    date: string;
    time: string;
    type: string;
    mode: string;
    location?: string;
    notes?: string;
  }): Promise<Appointment> {
    // First, get existing appointments to check for conflicts
    const { data: existingAppointments, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', appointmentData.doctor_id)
      .eq('date', appointmentData.date)
      .neq('status', 'cancelled');

    if (fetchError) {
      throw new Error(`Error checking conflicts: ${fetchError.message}`);
    }

    // Validate appointment scheduling
    const validation = validateAppointmentScheduling(
      {
        ...appointmentData,
        doctorId: appointmentData.doctor_id,
        patientId: appointmentData.patient_id
      },
      (existingAppointments as any[]) || []
    );

    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Create the appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        ...appointmentData,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating appointment: ${error.message}`);
    }

    return data as any;
  }

  async confirmAppointment(id: string, doctorId: string): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', id)
      .eq('doctor_id', doctorId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error confirming appointment: ${error.message}`);
    }

    return data as any;
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
    
    return (data as any[]) || [];
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
    
    return (data as any[]) || [];
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
    
    return data as any;
  }

  async getTodayAppointments(doctorId: string): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patient_id (
          id,
          profile:id (first_name, last_name)
        )
      `)
      .eq('doctor_id', doctorId)
      .eq('date', today)
      .order('time', { ascending: true });

    if (error) {
      throw new Error(`Error fetching today's appointments: ${error.message}`);
    }

    return (data as any[]) || [];
  }

  async getAppointmentsByUser(userId: string, role: 'doctor' | 'patient'): Promise<Appointment[]> {
    const column = role === 'doctor' ? 'doctor_id' : 'patient_id';
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctor_id (
          id,
          profile:id (first_name, last_name),
          specialty:specialty_id (name)
        ),
        patient:patient_id (
          id,
          profile:id (first_name, last_name)
        )
      `)
      .eq(column, userId)
      .order('date', { ascending: true });

    if (error) {
      throw new Error(`Error fetching appointments: ${error.message}`);
    }

    return (data as any[]) || [];
  }
}

export const appointmentService = new AppointmentService();
