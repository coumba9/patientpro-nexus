import { supabase } from "@/integrations/supabase/client";
import { validationService } from "./validation.service";
import { notificationService } from "./notification.service";
import { appointmentService } from "./appointment.service";
import { doctorService } from "./doctor.service";
import { patientService } from "./patient.service";
import { profileService } from "./profile.service";
import { medicalRecordService } from "./medical-record.service";
import { 
  Appointment, 
  Doctor, 
  Patient, 
  UserProfile, 
  MedicalRecord,
  ApiResponse,
  FormValidationResult 
} from "@/api/interfaces";
import { 
  calculateConsultationFees,
  generateReminderSchedule,
  getNextAvailableSlots,
  checkDailyLimits
} from "@/lib/businessLogic";

class BackendService {
  // User Registration with complete validation and setup
  async registerUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'patient' | 'doctor';
    speciality?: string;
    licenseNumber?: string;
    yearsOfExperience?: string;
  }): Promise<ApiResponse> {
    try {
      // Validate registration data
      const validation = await validationService.validateRegistration({
        ...userData,
        isDoctor: userData.role === 'doctor'
      });

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
            speciality: userData.speciality,
            licenseNumber: userData.licenseNumber,
            yearsOfExperience: userData.yearsOfExperience
          }
        }
      });

      if (authError) {
        return {
          success: false,
          error: authError.message
        };
      }

      // Additional setup is handled by the handle_new_user() trigger
      return {
        success: true,
        data: authData
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'inscription'
      };
    }
  }

  // Complete appointment booking with validation and notifications
  async bookAppointment(appointmentData: {
    doctorId: string;
    patientId: string;
    date: string;
    time: string;
    type: 'consultation' | 'follow_up' | 'emergency';
    mode: 'in_person' | 'teleconsultation';
    notes?: string;
  }): Promise<ApiResponse<Appointment>> {
    try {
      // Validate appointment data
      const validation = await validationService.validateAppointmentBooking(appointmentData);

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Check daily limits
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('date', appointmentData.date)
        .neq('status', 'cancelled');

      const dailyLimitCheck = checkDailyLimits(
        appointmentData.doctorId,
        appointmentData.patientId,
        appointmentData.date,
        existingAppointments as Appointment[]
      );

      if (!dailyLimitCheck.valid) {
        return {
          success: false,
          error: dailyLimitCheck.errors.join(', ')
        };
      }

      // Calculate fees
      const fees = calculateConsultationFees(appointmentData.type, appointmentData.mode);

      // Create appointment
      const appointment = await appointmentService.create({
        ...appointmentData,
        doctor_id: appointmentData.doctorId,
        patient_id: appointmentData.patientId,
        status: 'pending'
      });

      // Generate reminders
      const reminders = generateReminderSchedule(appointmentData.date, appointmentData.time);
      
      // Create reminders
      for (const reminder of reminders) {
        await notificationService.createReminder({
          appointment_id: appointment.id,
          patient_id: appointmentData.patientId,
          reminder_type: reminder.type as '24h' | '2h',
          method: reminder.method as 'email' | 'sms',
          scheduled_for: reminder.scheduledFor.toISOString(),
          status: 'pending',
          attempts: 0
        });
      }

      // Send confirmation notification to patient
      await notificationService.createNotification({
        type: 'appointment',
        title: 'Rendez-vous confirmé',
        message: `Votre rendez-vous du ${appointmentData.date} à ${appointmentData.time} a été confirmé`,
        user_id: appointmentData.patientId,
        appointment_id: appointment.id,
        priority: 'medium',
        is_read: false
      });

      // Send notification to doctor
      await notificationService.createNotification({
        type: 'appointment',
        title: 'Nouveau rendez-vous',
        message: `Nouveau rendez-vous programmé pour le ${appointmentData.date} à ${appointmentData.time}`,
        user_id: appointmentData.doctorId,
        appointment_id: appointment.id,
        priority: 'medium',
        is_read: false
      });

      return {
        success: true,
        data: appointment
      };
    } catch (error: any) {
      console.error('Appointment booking error:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la réservation du rendez-vous'
      };
    }
  }

  // Cancel appointment with proper validation and notifications
  async cancelAppointment(
    appointmentId: string, 
    userId: string, 
    userRole: string,
    cancellationReason: string
  ): Promise<ApiResponse> {
    try {
      // Validate cancellation
      const validation = await validationService.validateCancellation(appointmentId, userId, userRole);

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Cancel appointment
      await appointmentService.update(appointmentId, {
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: userId,
        cancellation_reason: cancellationReason,
        cancellation_type: userRole === 'doctor' ? 'doctor' : 'patient'
      });

      // Send cancellation notifications
      await notificationService.sendAppointmentCancellationNotification(appointmentId, userId);

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Cancellation error:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'annulation'
      };
    }
  }

  // Update doctor profile with validation
  async updateDoctorProfile(
    doctorId: string,
    profileData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      licenseNumber?: string;
      specialtyId?: string;
      yearsOfExperience?: number;
    }
  ): Promise<ApiResponse<Doctor>> {
    try {
      // Validate doctor profile data
      const validation = await validationService.validateDoctorProfile(doctorId, {
        licenseNumber: profileData.licenseNumber,
        specialtyId: profileData.specialtyId,
        yearsOfExperience: profileData.yearsOfExperience
      });

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Update profile if basic info changed
      if (profileData.firstName || profileData.lastName || profileData.email) {
        await profileService.update(doctorId, {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email
        });
      }

      // Update doctor-specific info
      const doctorUpdate: any = {};
      if (profileData.licenseNumber) doctorUpdate.license_number = profileData.licenseNumber;
      if (profileData.specialtyId) doctorUpdate.specialty_id = profileData.specialtyId;
      if (profileData.yearsOfExperience !== undefined) doctorUpdate.years_of_experience = profileData.yearsOfExperience;

      if (Object.keys(doctorUpdate).length > 0) {
        const updatedDoctor = await doctorService.update(doctorId, doctorUpdate);
        return {
          success: true,
          data: updatedDoctor
        };
      }

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Doctor profile update error:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la mise à jour du profil'
      };
    }
  }

  // Update patient profile
  async updatePatientProfile(
    patientId: string,
    profileData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      birthDate?: string;
      gender?: string;
      bloodType?: string;
      allergies?: string[];
    }
  ): Promise<ApiResponse<Patient>> {
    try {
      // Update profile if basic info changed
      if (profileData.firstName || profileData.lastName || profileData.email) {
        await profileService.update(patientId, {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email
        });
      }

      // Update patient-specific info
      const patientUpdate: any = {};
      if (profileData.birthDate) patientUpdate.birth_date = profileData.birthDate;
      if (profileData.gender) patientUpdate.gender = profileData.gender;
      if (profileData.bloodType) patientUpdate.blood_type = profileData.bloodType;
      if (profileData.allergies) patientUpdate.allergies = profileData.allergies;

      if (Object.keys(patientUpdate).length > 0) {
        // Create patient record if it doesn't exist
        const { data: existingPatient } = await supabase
          .from('patients')
          .select('id')
          .eq('id', patientId)
          .maybeSingle();

        if (!existingPatient) {
          const newPatient = await patientService.create({
            ...patientUpdate,
            id: patientId
          });
          return {
            success: true,
            data: newPatient
          };
        } else {
          const updatedPatient = await patientService.update(patientId, patientUpdate);
          return {
            success: true,
            data: updatedPatient
          };
        }
      }

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Patient profile update error:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la mise à jour du profil'
      };
    }
  }

  // Create medical record with validation
  async createMedicalRecord(recordData: {
    patientId: string;
    doctorId: string;
    diagnosis: string;
    prescription?: string;
    notes?: string;
    date: string;
  }, userId: string): Promise<ApiResponse<MedicalRecord>> {
    try {
      // Validate medical record
      const validation = await validationService.validateMedicalRecord(recordData, userId);

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Create medical record
      const medicalRecord = await medicalRecordService.addMedicalRecord({
        patient_id: recordData.patientId,
        doctor_id: recordData.doctorId,
        diagnosis: recordData.diagnosis,
        prescription: recordData.prescription,
        notes: recordData.notes,
        date: recordData.date
      });

      // Send notification to patient
      await notificationService.createNotification({
        type: 'appointment',
        title: 'Nouveau dossier médical',
        message: 'Un nouveau dossier médical a été ajouté à votre profil',
        user_id: recordData.patientId,
        priority: 'medium',
        is_read: false
      });

      return {
        success: true,
        data: medicalRecord
      };
    } catch (error: any) {
      console.error('Medical record creation error:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la création du dossier médical'
      };
    }
  }

  // Get available time slots for a doctor
  async getAvailableSlots(doctorId: string, date: string): Promise<ApiResponse<string[]>> {
    try {
      // Get existing appointments for the doctor on that date
      const { data: existingAppointments, error } = await supabase
        .from('appointments')
        .select('time, type')
        .eq('doctor_id', doctorId)
        .eq('date', date)
        .neq('status', 'cancelled');

      if (error) {
        throw error;
      }

      const nextSlots = getNextAvailableSlots(doctorId, existingAppointments as Appointment[], 1);
      const availableSlots = nextSlots
        .filter(slot => slot.date === date)
        .map(slot => slot.time);

      return {
        success: true,
        data: availableSlots
      };
    } catch (error: any) {
      console.error('Error getting available slots:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des créneaux'
      };
    }
  }

  // Get comprehensive dashboard data
  async getDashboardData(userId: string, userRole: string): Promise<ApiResponse> {
    try {
      const dashboardData: any = {};

      if (userRole === 'patient') {
        // Get patient appointments
        const { data: appointments } = await supabase
          .from('appointments')
          .select(`
            *,
            doctor:doctor_id (
              id,
              profile:id (first_name, last_name)
            )
          `)
          .eq('patient_id', userId)
          .order('date', { ascending: true });

        // Get patient medical records
        const { data: medicalRecords } = await supabase
          .from('medical_records')
          .select(`
            *,
            doctor:doctor_id (
              id,
              profile:id (first_name, last_name)
            )
          `)
          .eq('patient_id', userId)
          .order('date', { ascending: false });

        dashboardData.appointments = appointments;
        dashboardData.medicalRecords = medicalRecords;
      } else if (userRole === 'doctor') {
        // Get doctor appointments
        const { data: appointments } = await supabase
          .from('appointments')
          .select(`
            *,
            patient:patient_id (
              id,
              profile:id (first_name, last_name)
            )
          `)
          .eq('doctor_id', userId)
          .order('date', { ascending: true });

        // Get doctor's patients count
        const { count: patientsCount } = await supabase
          .from('appointments')
          .select('patient_id', { count: 'exact', head: true })
          .eq('doctor_id', userId);

        dashboardData.appointments = appointments;
        dashboardData.patientsCount = patientsCount;
      }

      // Get notifications for all users
      const notifications = await notificationService.getNotificationsByUser(userId);
      dashboardData.notifications = notifications;

      return {
        success: true,
        data: dashboardData
      };
    } catch (error: any) {
      console.error('Dashboard data error:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors du chargement du tableau de bord'
      };
    }
  }

  // Search functionality
  async searchDoctors(query: {
    specialty?: string;
    location?: string;
    name?: string;
    availableDate?: string;
  }): Promise<ApiResponse<any[]>> {
    try {
      let queryBuilder = supabase
        .from('doctors')
        .select(`
          *,
          specialty:specialty_id (id, name),
          profile:id (first_name, last_name, email)
        `)
        .eq('is_verified', true);

      if (query.specialty) {
        queryBuilder = queryBuilder.eq('specialty_id', query.specialty);
      }

      if (query.name) {
        queryBuilder = queryBuilder.or(
          `profile.first_name.ilike.%${query.name}%,profile.last_name.ilike.%${query.name}%`
        );
      }

      const { data: doctors, error } = await queryBuilder;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: doctors as any[]
      };
    } catch (error: any) {
      console.error('Doctor search error:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la recherche'
      };
    }
  }
}

export const backendService = new BackendService();