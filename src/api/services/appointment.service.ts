
import { BaseService, TableName } from "../base/base.service";
import { Appointment, CancellationRequest } from "../interfaces";
import { supabase } from "@/integrations/supabase/client";
import { calculateConsultationFees } from "@/lib/businessLogic";
import { computeAvailableSlots, parseLocalDateString, WEEKDAYS_FR } from "@/lib/availability";

class AppointmentService extends BaseService<Appointment> {
  constructor() {
    super('appointments' as TableName);
  }

  // Vérifier la disponibilité réelle selon les horaires, la durée et les exceptions.
  async checkSlotAvailability(appointmentData: {
    doctor_id: string;
    date: string;
    time: string;
    duration_minutes?: number;
    location_id?: string | null;
    timeZone?: string;
  }): Promise<{ available: boolean; error?: string }> {
    const selectedDate = parseLocalDateString(appointmentData.date);
    const dayName = WEEKDAYS_FR[selectedDate.getDay()];
    const [slotsRes, unavailRes, apptRes] = await Promise.all([
      supabase
        .from("doctor_availability_slots")
        .select("start_time, end_time, location_id")
        .eq("doctor_id", appointmentData.doctor_id)
        .eq("day", dayName),
      supabase
        .from("doctor_unavailability_periods")
        .select("start_date, end_date, start_time, end_time, is_full_day")
        .eq("doctor_id", appointmentData.doctor_id)
        .lte("start_date", appointmentData.date)
        .gte("end_date", appointmentData.date),
      supabase
        .from("appointments")
        .select("time, duration_minutes")
        .eq("doctor_id", appointmentData.doctor_id)
        .eq("date", appointmentData.date)
        .neq("status", "cancelled"),
    ]);

    const firstError = slotsRes.error || unavailRes.error || apptRes.error;
    if (firstError) return { available: false, error: `Erreur lors de la vérification: ${firstError.message}` };

    const availableSlots = computeAvailableSlots({
      ranges: (slotsRes.data || []) as any,
      unavailability: (unavailRes.data || []) as any,
      booked: (apptRes.data || []) as any,
      durationMinutes: appointmentData.duration_minutes || 30,
      selectedDate,
      locationId: appointmentData.location_id,
      timeZone: appointmentData.timeZone,
    });
    const normalizedTime = appointmentData.time.substring(0, 5);
    if (!availableSlots.includes(normalizedTime)) {
      return { available: false, error: "Ce créneau n'est plus disponible ou ne respecte pas la durée choisie" };
    }

    return { available: true };
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
     status?: string;
     duration_minutes?: number;
     location_id?: string | null;
     reason_id?: string | null;
     payment_status?: string;
     payment_amount?: number;
     timeZone?: string;
  }): Promise<Appointment> {
    const slotCheck = await this.checkSlotAvailability({
      doctor_id: appointmentData.doctor_id,
      date: appointmentData.date,
      time: appointmentData.time,
      duration_minutes: appointmentData.duration_minutes,
      location_id: appointmentData.location_id,
      timeZone: appointmentData.timeZone,
    });

    if (!slotCheck.available) {
      throw new Error(slotCheck.error || 'Ce créneau n\'est pas disponible');
    }

    // Le créneau est libre → le rendez-vous est confirmé automatiquement
    const { timeZone: _tz, ...insertData } = appointmentData;
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        ...insertData,
        status: appointmentData.status || 'confirmed'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating appointment: ${error.message}`);
    }

    // SMS de confirmation automatique (non bloquant)
    this.sendAppointmentConfirmationSMS(data as any).catch((e) =>
      console.error('SMS de confirmation non envoyé:', e)
    );

    return data as any;
  }

  // Construit et envoie le SMS de confirmation avec créneau et motif.
  async sendAppointmentConfirmationSMS(
    appointment: any,
    overrides?: { phoneNumber?: string | null; doctorName?: string | null }
  ): Promise<void> {
    if (!appointment?.patient_id || appointment.status !== 'confirmed') return;

    const [profileRes, patientRes, doctorRes, reasonRes, locationRes] = await Promise.all([
      supabase.from('profiles').select('phone_number, first_name').eq('id', appointment.patient_id).maybeSingle(),
      supabase.from('patients').select('phone_number').eq('id', appointment.patient_id).maybeSingle(),
      supabase.rpc('get_doctor_brief', { doctor_id: appointment.doctor_id }),
      appointment.reason_id
        ? supabase.from('consultation_reasons').select('name').eq('id', appointment.reason_id).maybeSingle()
        : Promise.resolve({ data: null } as any),
      appointment.location_id
        ? supabase.from('practice_locations').select('name, address').eq('id', appointment.location_id).maybeSingle()
        : Promise.resolve({ data: null } as any),
    ]);

    const phoneNumber = overrides?.phoneNumber || profileRes.data?.phone_number || patientRes.data?.phone_number;
    if (!phoneNumber) return;

    const doctor = Array.isArray(doctorRes.data) ? doctorRes.data[0] : doctorRes.data;
    const doctorName = overrides?.doctorName || (doctor
      ? `${doctor.first_name ?? ''} ${doctor.last_name ?? ''}`.trim()
      : 'votre médecin');
    const reason = reasonRes.data?.name || appointment.type || null;
    const location = locationRes.data?.name || appointment.location || null;

    const { smsService } = await import('./sms.service');
    const result = await smsService.sendAppointmentConfirmation(
      appointment.patient_id,
      phoneNumber,
      appointment.date,
      appointment.time,
      doctorName,
      { reason, location, durationMinutes: appointment.duration_minutes }
    );

    if (!result.success) {
      console.error('Échec du SMS de confirmation:', result.error);
    }
  }



  async confirmAppointment(id: string, doctorId: string): Promise<Appointment> {
    // Validation directe par le médecin (rendez-vous hérités en statut 'pending')
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', id)
      .eq('doctor_id', doctorId)
      .in('status', ['pending', 'awaiting_patient_confirmation'])
      .select()
      .single();

    if (error) {
      throw new Error(`Error confirming appointment: ${error.message}`);
    }

    return data as any;
  }

  async patientConfirmAppointment(id: string, patientId: string): Promise<Appointment> {
    // Compatibilité : anciens rendez-vous en attente de confirmation patient
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', id)
      .eq('patient_id', patientId)
      .in('status', ['awaiting_patient_confirmation', 'pending'])
      .select()
      .single();

    if (error) {
      throw new Error(`Error confirming appointment: ${error.message}`);
    }

    return data as any;
  }

  // Le médecin accepte la demande de report du patient
  async acceptReschedule(appointmentId: string, doctorId: string): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        status: 'confirmed',
        previous_date: null,
        previous_time: null,
        reschedule_reason: null,
        reschedule_requested_by: null,
        reschedule_requested_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .eq('doctor_id', doctorId)
      .eq('status', 'pending_reschedule')
      .select()
      .single();

    if (error) throw new Error(`Error accepting reschedule: ${error.message}`);
    return data as any;
  }

  // Le médecin refuse le report : on rétablit la date/heure initiale
  async rejectReschedule(appointmentId: string, doctorId: string, reason?: string): Promise<Appointment> {
    const current = await this.getById(appointmentId);
    if (!current) throw new Error("Rendez-vous non trouvé");

    const { data, error } = await supabase
      .from('appointments')
      .update({
        status: 'confirmed',
        date: (current as any).previous_date || current.date,
        time: (current as any).previous_time || current.time,
        previous_date: null,
        previous_time: null,
        reschedule_reason: reason ? `Report refusé : ${reason}` : 'Report refusé par le médecin',
        reschedule_requested_by: null,
        reschedule_requested_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .eq('doctor_id', doctorId)
      .eq('status', 'pending_reschedule')
      .select()
      .single();

    if (error) throw new Error(`Error rejecting reschedule: ${error.message}`);
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

  async getAvailableSlots(
    doctorId: string,
    targetDate: string,
    options?: {
      durationMinutes?: number;
      locationId?: string | null;
      timeZone?: string;
      excludeAppointmentId?: string;
    }
  ): Promise<string[]> {
    const selectedDate = parseLocalDateString(targetDate);
    const dayName = WEEKDAYS_FR[selectedDate.getDay()];
    const [slotsRes, unavailRes, apptRes] = await Promise.all([
      supabase
        .from("doctor_availability_slots")
        .select("start_time, end_time, location_id")
        .eq("doctor_id", doctorId)
        .eq("day", dayName),
      supabase
        .from("doctor_unavailability_periods")
        .select("start_date, end_date, start_time, end_time, is_full_day")
        .eq("doctor_id", doctorId)
        .lte("start_date", targetDate)
        .gte("end_date", targetDate),
      supabase
        .from("appointments")
        .select("id, time, duration_minutes")
        .eq("doctor_id", doctorId)
        .eq("date", targetDate)
        .neq("status", "cancelled"),
    ]);
    const firstError = slotsRes.error || unavailRes.error || apptRes.error;
    if (firstError) throw new Error(`Error fetching slots: ${firstError.message}`);

    const booked = ((apptRes.data || []) as any[]).filter(
      (appointment) => appointment.id !== options?.excludeAppointmentId
    );

    return computeAvailableSlots({
      ranges: (slotsRes.data || []) as any,
      unavailability: (unavailRes.data || []) as any,
      booked,
      durationMinutes: options?.durationMinutes || 30,
      selectedDate,
      locationId: options?.locationId,
      timeZone: options?.timeZone,
    });
  }

  async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTime: string,
    userId: string,
    userRole: 'doctor' | 'patient',
    reason?: string
  ): Promise<Appointment> {
    try {
      // Get the current appointment
      const appointment = await this.getById(appointmentId);
      if (!appointment) {
        throw new Error("Rendez-vous non trouvé");
      }

      // Verify the user is authorized to reschedule
      if (userRole === 'doctor' && appointment.doctor_id !== userId) {
        throw new Error("Non autorisé à reporter ce rendez-vous");
      }
      if (userRole === 'patient' && appointment.patient_id !== userId) {
        throw new Error("Non autorisé à reporter ce rendez-vous");
      }

      if (['cancelled', 'completed'].includes(appointment.status as string)) {
        throw new Error("Ce rendez-vous ne peut plus être reporté");
      }
      if (appointment.status === ('pending_reschedule' as any) && userRole === 'patient') {
        throw new Error("Une demande de report est déjà en attente de validation");
      }

      // Check if the new slot is available
       const availableSlots = await this.getAvailableSlots(appointment.doctor_id, newDate, {
         durationMinutes: (appointment as any).duration_minutes || 30,
         locationId: (appointment as any).location_id,
         timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
         excludeAppointmentId: appointmentId,
       });
      if (!availableSlots.includes(newTime)) {
        throw new Error("Ce créneau n'est pas disponible");
      }

      // If patient is rescheduling, set status to pending_reschedule and save previous date/time
      // If doctor is rescheduling, update directly
      const updateData: any = {
        date: newDate,
        time: newTime,
        reschedule_reason: reason || null,
        reschedule_requested_by: userId,
        reschedule_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Only save previous date/time if patient is rescheduling
      if (userRole === 'patient') {
        updateData.previous_date = appointment.date;
        updateData.previous_time = appointment.time;
        updateData.status = 'pending_reschedule';
      } else {
        // Doctor reschedule is immediate
        updateData.status = 'confirmed';
      }

      // Update the appointment
      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) throw error;

      return data as Appointment;
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  }
}

export const appointmentService = new AppointmentService();
