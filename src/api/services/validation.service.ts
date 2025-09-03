import { supabase } from "@/integrations/supabase/client";
import { validateEmail, validatePassword, validateLicenseNumber } from "@/lib/validation";
import { hasAppointmentConflict, validateAppointmentScheduling } from "@/lib/businessLogic";
import { Appointment } from "@/api/interfaces";

class ValidationService {
  // Check if email already exists
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      return !!data && !error;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }

  // Check if license number already exists
  async checkLicenseExists(licenseNumber: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id')
        .eq('license_number', licenseNumber.toUpperCase())
        .maybeSingle();
      
      return !!data && !error;
    } catch (error) {
      console.error('Error checking license:', error);
      return false;
    }
  }

  // Validate registration data
  async validateRegistration(formData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    isDoctor?: boolean;
    speciality?: string;
    licenseNumber?: string;
    yearsOfExperience?: string;
  }): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Basic validation
    if (!formData.firstName.trim()) {
      errors.push('Le prénom est requis');
    }

    if (!formData.lastName.trim()) {
      errors.push('Le nom est requis');
    }

    if (!formData.email.trim()) {
      errors.push('L\'email est requis');
    } else if (!validateEmail(formData.email)) {
      errors.push('Format d\'email invalide');
    } else {
      // Check if email already exists
      const emailExists = await this.checkEmailExists(formData.email);
      if (emailExists) {
        errors.push('Cet email est déjà utilisé');
      }
    }

    // Password validation
    if (!formData.password) {
      errors.push('Le mot de passe est requis');
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }

    if (formData.password !== formData.confirmPassword) {
      errors.push('Les mots de passe ne correspondent pas');
    }

    // Doctor-specific validation
    if (formData.isDoctor) {
      if (!formData.speciality) {
        errors.push('La spécialité est requise pour les médecins');
      }

      if (!formData.licenseNumber?.trim()) {
        errors.push('Le numéro de licence est requis');
      } else if (!validateLicenseNumber(formData.licenseNumber)) {
        errors.push('Format de numéro de licence invalide');
      } else {
        // Check if license already exists
        const licenseExists = await this.checkLicenseExists(formData.licenseNumber);
        if (licenseExists) {
          errors.push('Ce numéro de licence est déjà utilisé');
        }
      }

      if (!formData.yearsOfExperience) {
        errors.push('Les années d\'expérience sont requises');
      } else {
        const years = parseInt(formData.yearsOfExperience);
        if (isNaN(years) || years < 0 || years > 50) {
          errors.push('Les années d\'expérience doivent être entre 0 et 50');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate appointment booking
  async validateAppointmentBooking(appointmentData: {
    doctorId: string;
    patientId: string;
    date: string;
    time: string;
    type: string;
    mode: string;
  }): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Get existing appointments for the doctor on that date
      const { data: existingAppointments, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', appointmentData.doctorId)
        .eq('date', appointmentData.date)
        .neq('status', 'cancelled');

      if (error) {
        console.error('Error fetching appointments:', error);
        errors.push('Erreur lors de la vérification des disponibilités');
        return { isValid: false, errors };
      }

      // Validate scheduling rules
      const schedulingValidation = validateAppointmentScheduling(
        appointmentData,
        existingAppointments as Appointment[]
      );

      if (!schedulingValidation.valid) {
        errors.push(...schedulingValidation.errors);
      }

      // Check if patient already has an appointment on the same day
      const { data: patientAppointments, error: patientError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', appointmentData.patientId)
        .eq('date', appointmentData.date)
        .neq('status', 'cancelled');

      if (patientError) {
        console.error('Error fetching patient appointments:', patientError);
        errors.push('Erreur lors de la vérification des rendez-vous existants');
        return { isValid: false, errors };
      }

      if (patientAppointments && patientAppointments.length > 0) {
        errors.push('Vous avez déjà un rendez-vous programmé pour cette journée');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Validation error:', error);
      return {
        isValid: false,
        errors: ['Erreur lors de la validation du rendez-vous']
      };
    }
  }

  // Validate doctor profile update
  async validateDoctorProfile(doctorId: string, profileData: {
    licenseNumber?: string;
    specialtyId?: string;
    yearsOfExperience?: number;
  }): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Validate license number if provided
      if (profileData.licenseNumber) {
        if (!validateLicenseNumber(profileData.licenseNumber)) {
          errors.push('Format de numéro de licence invalide');
        } else {
          // Check if license exists for another doctor
          const { data: existingLicense, error } = await supabase
            .from('doctors')
            .select('id')
            .eq('license_number', profileData.licenseNumber.toUpperCase())
            .neq('id', doctorId)
            .maybeSingle();

          if (error) {
            console.error('Error checking license:', error);
            errors.push('Erreur lors de la vérification du numéro de licence');
          } else if (existingLicense) {
            errors.push('Ce numéro de licence est déjà utilisé par un autre médecin');
          }
        }
      }

      // Validate years of experience
      if (profileData.yearsOfExperience !== undefined) {
        if (profileData.yearsOfExperience < 0 || profileData.yearsOfExperience > 50) {
          errors.push('Les années d\'expérience doivent être entre 0 et 50');
        }
      }

      // Validate specialty exists
      if (profileData.specialtyId) {
        const { data: specialty, error } = await supabase
          .from('specialties')
          .select('id')
          .eq('id', profileData.specialtyId)
          .eq('status', 'active')
          .maybeSingle();

        if (error) {
          console.error('Error checking specialty:', error);
          errors.push('Erreur lors de la vérification de la spécialité');
        } else if (!specialty) {
          errors.push('Spécialité invalide ou inactive');
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Doctor profile validation error:', error);
      return {
        isValid: false,
        errors: ['Erreur lors de la validation du profil médecin']
      };
    }
  }

  // Validate cancellation request
  async validateCancellation(appointmentId: string, userId: string, userRole: string): Promise<{
    isValid: boolean;
    errors: string[];
    appointment?: Appointment;
  }> {
    const errors: string[] = [];

    try {
      // Get appointment details
      const { data: appointment, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (error || !appointment) {
        errors.push('Rendez-vous introuvable');
        return { isValid: false, errors };
      }

      // Check if user is authorized to cancel
      const isAuthorized = 
        appointment.patient_id === userId || 
        appointment.doctor_id === userId ||
        userRole === 'admin';

      if (!isAuthorized) {
        errors.push('Vous n\'êtes pas autorisé à annuler ce rendez-vous');
      }

      // Check if appointment can be cancelled
      if (appointment.status === 'cancelled') {
        errors.push('Ce rendez-vous est déjà annulé');
      }

      if (appointment.status === 'completed') {
        errors.push('Ce rendez-vous est déjà terminé et ne peut pas être annulé');
      }

      // Check cancellation deadline (24 hours before)
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
      const deadline = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
      const now = new Date();

      if (now > deadline && userRole !== 'admin') {
        errors.push('Les annulations doivent être effectuées au moins 24 heures avant le rendez-vous');
      }

      return {
        isValid: errors.length === 0,
        errors,
        appointment: appointment as Appointment
      };
    } catch (error) {
      console.error('Cancellation validation error:', error);
      return {
        isValid: false,
        errors: ['Erreur lors de la validation de l\'annulation']
      };
    }
  }

  // Validate medical record creation
  async validateMedicalRecord(recordData: {
    patientId: string;
    doctorId: string;
    diagnosis: string;
    prescription?: string;
    notes?: string;
  }, userId: string): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Only doctors can create medical records for their patients
      if (recordData.doctorId !== userId) {
        errors.push('Vous ne pouvez créer que vos propres dossiers médicaux');
      }

      // Validate required fields
      if (!recordData.diagnosis?.trim()) {
        errors.push('Le diagnostic est requis');
      }

      // Check if patient exists
      const { data: patient, error } = await supabase
        .from('patients')
        .select('id')
        .eq('id', recordData.patientId)
        .maybeSingle();

      if (error) {
        console.error('Error checking patient:', error);
        errors.push('Erreur lors de la vérification du patient');
      } else if (!patient) {
        errors.push('Patient introuvable');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Medical record validation error:', error);
      return {
        isValid: false,
        errors: ['Erreur lors de la validation du dossier médical']
      };
    }
  }
}

export const validationService = new ValidationService();