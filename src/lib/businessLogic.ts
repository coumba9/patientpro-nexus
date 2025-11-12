import { Appointment, CancellationPolicy } from "@/api/interfaces";

// Business hours configuration
export const BUSINESS_HOURS = {
  start: 8, // 8:00 AM
  end: 18,  // 6:00 PM
  duration: 30, // 30 minutes per slot
};

// Appointment status transitions
export const APPOINTMENT_STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  cancelled: [], // Terminal state
  completed: [], // Terminal state
};

// Calculate business hours slots for a given date
export const getAvailableTimeSlots = (date: string, bookedSlots: string[] = []): string[] => {
  const slots: string[] = [];
  const { start, end, duration } = BUSINESS_HOURS;
  
  for (let hour = start; hour < end; hour++) {
    for (let minute = 0; minute < 60; minute += duration) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      if (!bookedSlots.includes(timeSlot)) {
        slots.push(timeSlot);
      }
    }
  }
  
  return slots;
};

// Check if appointment time is within business hours
export const isWithinBusinessHours = (time: string): boolean => {
  // Normalize time format (handle both HH:MM and HH:MM:SS)
  const normalizedTime = time.substring(0, 5);
  const [hours, minutes] = normalizedTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const startMinutes = BUSINESS_HOURS.start * 60;
  const endMinutes = BUSINESS_HOURS.end * 60;
  
  return totalMinutes >= startMinutes && totalMinutes < endMinutes;
};

// Calculate cancellation deadline based on policy
export const getCancellationDeadline = (
  appointmentDate: string, 
  appointmentTime: string,
  policy: CancellationPolicy
): Date => {
  const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
  const deadline = new Date(appointmentDateTime);
  deadline.setHours(deadline.getHours() - policy.minimum_hours_before);
  
  return deadline;
};

// Check if cancellation is allowed
export const canCancelAppointment = (
  appointment: Appointment,
  policy: CancellationPolicy
): { allowed: boolean; reason?: string } => {
  const now = new Date();
  const deadline = getCancellationDeadline(appointment.date, appointment.time, policy);
  
  if (now > deadline) {
    return {
      allowed: false,
      reason: `L'annulation doit être effectuée au moins ${policy.minimum_hours_before} heures avant le rendez-vous`
    };
  }
  
  if (appointment.status === 'cancelled') {
    return {
      allowed: false,
      reason: 'Ce rendez-vous est déjà annulé'
    };
  }
  
  if (appointment.status === 'completed') {
    return {
      allowed: false,
      reason: 'Ce rendez-vous est déjà terminé'
    };
  }
  
  return { allowed: true };
};

// Calculate appointment duration based on type
export const getAppointmentDuration = (type: string): number => {
  const durations = {
    consultation: 30,
    follow_up: 20,
    emergency: 60,
  };
  
  return durations[type as keyof typeof durations] || 30;
};

// Check for appointment conflicts
export const hasAppointmentConflict = (
  newAppointment: { date: string; time: string; type: string; doctorId: string },
  existingAppointments: Appointment[]
): boolean => {
  // Normalize time format (HH:MM or HH:MM:SS to HH:MM)
  const normalizedNewTime = newAppointment.time.substring(0, 5);
  
  const newDuration = getAppointmentDuration(newAppointment.type);
  const newStart = new Date(`${newAppointment.date}T${normalizedNewTime}:00`);
  const newEnd = new Date(newStart.getTime() + newDuration * 60000);
  
  return existingAppointments.some(existing => {
    if (existing.doctor_id !== newAppointment.doctorId) return false;
    if (existing.date !== newAppointment.date) return false;
    if (existing.status === 'cancelled') return false;
    
    const normalizedExistingTime = existing.time.substring(0, 5);
    const existingDuration = getAppointmentDuration(existing.type);
    const existingStart = new Date(`${existing.date}T${normalizedExistingTime}:00`);
    const existingEnd = new Date(existingStart.getTime() + existingDuration * 60000);
    
    // Check for overlap
    return (newStart < existingEnd && newEnd > existingStart);
  });
};

// Calculate fees based on consultation type
export const calculateConsultationFees = (type: string, mode: string): number => {
  const baseFees = {
    consultation: 15000, // 15,000 CFA
    follow_up: 10000,    // 10,000 CFA
    emergency: 25000,    // 25,000 CFA
  };
  
  const baseFee = baseFees[type as keyof typeof baseFees] || baseFees.consultation;
  
  // Teleconsultation discount
  if (mode === 'teleconsultation') {
    return Math.round(baseFee * 0.8); // 20% discount
  }
  
  return baseFee;
};

// Validate appointment scheduling rules
export const validateAppointmentScheduling = (
  appointment: {
    date: string;
    time: string;
    type: string;
    mode: string;
    doctorId: string;
    patientId: string;
  },
  existingAppointments: Appointment[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check future date - normalize time format
  const normalizedTime = appointment.time.substring(0, 5);
  const appointmentDate = new Date(`${appointment.date}T${normalizedTime}:00`);
  const now = new Date();
  
  if (appointmentDate <= now) {
    errors.push('Le rendez-vous doit être programmé dans le futur');
  }
  
  // Check business hours
  if (!isWithinBusinessHours(appointment.time)) {
    errors.push('Le rendez-vous doit être programmé pendant les heures ouvrables (8h00 - 18h00)');
  }
  
  // Check conflicts
  if (hasAppointmentConflict(appointment, existingAppointments)) {
    errors.push('Ce créneau est déjà occupé');
  }
  
  // Check maximum advance booking (90 days)
  const maxAdvanceDate = new Date();
  maxAdvanceDate.setDate(maxAdvanceDate.getDate() + 90);
  
  if (appointmentDate > maxAdvanceDate) {
    errors.push('Les rendez-vous ne peuvent être programmés que 90 jours à l\'avance maximum');
  }
  
  // Check minimum advance booking (1 hour for regular, 30 minutes for emergency)
  const minAdvanceHours = appointment.type === 'emergency' ? 0.5 : 1;
  const minAdvanceDate = new Date();
  minAdvanceDate.setHours(minAdvanceDate.getHours() + minAdvanceHours);
  
  if (appointmentDate < minAdvanceDate) {
    const minAdvanceText = appointment.type === 'emergency' ? '30 minutes' : '1 heure';
    errors.push(`Le rendez-vous doit être programmé au moins ${minAdvanceText} à l'avance`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Generate reminder schedule for appointment
export const generateReminderSchedule = (appointmentDate: string, appointmentTime: string) => {
  const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
  
  const reminders = [
    {
      type: '24h',
      scheduledFor: new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000),
      method: 'email'
    },
    {
      type: '2h',
      scheduledFor: new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000),
      method: 'sms'
    }
  ];
  
  return reminders.filter(reminder => reminder.scheduledFor > new Date());
};

// Patient age calculation
export const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Check if patient is minor
export const isMinor = (birthDate: string): boolean => {
  return calculateAge(birthDate) < 18;
};

// Generate next available slots for a doctor
export const getNextAvailableSlots = (
  doctorId: string,
  existingAppointments: Appointment[],
  days: number = 7
): Array<{ date: string; time: string }> => {
  const slots: Array<{ date: string; time: string }> = [];
  const today = new Date();
  
  for (let i = 1; i <= days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const dateString = date.toISOString().split('T')[0];
    const bookedSlots = existingAppointments
      .filter(apt => apt.doctor_id === doctorId && apt.date === dateString && apt.status !== 'cancelled')
      .map(apt => apt.time);
    
    const availableSlots = getAvailableTimeSlots(dateString, bookedSlots);
    
    availableSlots.slice(0, 3).forEach(time => {
      slots.push({ date: dateString, time });
    });
  }
  
  return slots.slice(0, 10); // Return max 10 slots
};

// Validate business logic constraints
export const validateBusinessConstraints = {
  maxAppointmentsPerDay: 16, // 8 hours * 2 appointments per hour
  maxAppointmentsPerPatientPerDay: 1,
  emergencyAppointmentBuffer: 30, // minutes
  teleconsultationMinimumAge: 16, // years
};

// Check daily appointment limits
export const checkDailyLimits = (
  doctorId: string,
  patientId: string,
  date: string,
  existingAppointments: Appointment[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  const doctorAppointments = existingAppointments.filter(
    apt => apt.doctor_id === doctorId && apt.date === date && apt.status !== 'cancelled'
  );
  
  const patientAppointments = existingAppointments.filter(
    apt => apt.patient_id === patientId && apt.date === date && apt.status !== 'cancelled'
  );
  
  if (doctorAppointments.length >= validateBusinessConstraints.maxAppointmentsPerDay) {
    errors.push('Le médecin a atteint sa limite de consultations pour cette journée');
  }
  
  if (patientAppointments.length >= validateBusinessConstraints.maxAppointmentsPerPatientPerDay) {
    errors.push('Vous avez déjà un rendez-vous programmé pour cette journée');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};