import { ValidationError, FormValidationResult } from "@/api/interfaces";

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères");
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une lettre minuscule");
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une lettre majuscule");
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Phone validation (French format)
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(?:(?:\+33|0)[1-9](?:[0-9]{8}))$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// License number validation
export const validateLicenseNumber = (license: string): boolean => {
  // Format: minimum 6 characters, alphanumeric
  const licenseRegex = /^[A-Z0-9]{6,}$/i;
  return licenseRegex.test(license);
};

// Date validation
export const validateDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

// Future date validation
export const validateFutureDate = (date: string): boolean => {
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateObj > today;
};

// Time validation (HH:MM format)
export const validateTime = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Registration form validation
export const validateRegistrationForm = (formData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  isDoctor?: boolean;
  speciality?: string;
  licenseNumber?: string;
  yearsOfExperience?: string;
}): FormValidationResult => {
  const errors: ValidationError[] = [];

  // Required fields validation
  if (!formData.firstName.trim()) {
    errors.push({ field: 'firstName', message: 'Le prénom est requis' });
  }

  if (!formData.lastName.trim()) {
    errors.push({ field: 'lastName', message: 'Le nom est requis' });
  }

  if (!formData.email.trim()) {
    errors.push({ field: 'email', message: 'L\'email est requis' });
  } else if (!validateEmail(formData.email)) {
    errors.push({ field: 'email', message: 'Format d\'email invalide' });
  }

  if (!formData.password) {
    errors.push({ field: 'password', message: 'Le mot de passe est requis' });
  } else {
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      passwordValidation.errors.forEach(error => {
        errors.push({ field: 'password', message: error });
      });
    }
  }

  if (formData.password !== formData.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Les mots de passe ne correspondent pas' });
  }

  // Doctor-specific validations
  if (formData.isDoctor) {
    if (!formData.speciality) {
      errors.push({ field: 'speciality', message: 'La spécialité est requise pour les médecins' });
    }

    if (!formData.licenseNumber?.trim()) {
      errors.push({ field: 'licenseNumber', message: 'Le numéro de licence est requis' });
    } else if (!validateLicenseNumber(formData.licenseNumber)) {
      errors.push({ field: 'licenseNumber', message: 'Format de numéro de licence invalide (minimum 6 caractères alphanumériques)' });
    }

    if (!formData.yearsOfExperience) {
      errors.push({ field: 'yearsOfExperience', message: 'Les années d\'expérience sont requises' });
    } else {
      const years = parseInt(formData.yearsOfExperience);
      if (isNaN(years) || years < 0 || years > 50) {
        errors.push({ field: 'yearsOfExperience', message: 'Les années d\'expérience doivent être entre 0 et 50' });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Appointment form validation
export const validateAppointmentForm = (formData: {
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  type: string;
  mode: string;
  notes?: string;
}): FormValidationResult => {
  const errors: ValidationError[] = [];

  if (!formData.doctorId) {
    errors.push({ field: 'doctorId', message: 'Médecin requis' });
  }

  if (!formData.patientId) {
    errors.push({ field: 'patientId', message: 'Patient requis' });
  }

  if (!formData.date) {
    errors.push({ field: 'date', message: 'Date requise' });
  } else if (!validateDate(formData.date)) {
    errors.push({ field: 'date', message: 'Format de date invalide' });
  } else if (!validateFutureDate(formData.date)) {
    errors.push({ field: 'date', message: 'La date doit être dans le futur' });
  }

  if (!formData.time) {
    errors.push({ field: 'time', message: 'Heure requise' });
  } else if (!validateTime(formData.time)) {
    errors.push({ field: 'time', message: 'Format d\'heure invalide (HH:MM)' });
  }

  if (!formData.type) {
    errors.push({ field: 'type', message: 'Type de consultation requis' });
  }

  if (!formData.mode) {
    errors.push({ field: 'mode', message: 'Mode de consultation requis' });
  }

  // Validate business hours (8:00 - 18:00)
  if (formData.time && validateTime(formData.time)) {
    const [hours] = formData.time.split(':').map(Number);
    if (hours < 8 || hours >= 18) {
      errors.push({ field: 'time', message: 'Les consultations sont disponibles de 8h00 à 18h00' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Medical record validation
export const validateMedicalRecord = (formData: {
  patientId: string;
  doctorId: string;
  diagnosis: string;
  prescription?: string;
  notes?: string;
  date: string;
}): FormValidationResult => {
  const errors: ValidationError[] = [];

  if (!formData.patientId) {
    errors.push({ field: 'patientId', message: 'Patient requis' });
  }

  if (!formData.doctorId) {
    errors.push({ field: 'doctorId', message: 'Médecin requis' });
  }

  if (!formData.diagnosis.trim()) {
    errors.push({ field: 'diagnosis', message: 'Diagnostic requis' });
  }

  if (!formData.date) {
    errors.push({ field: 'date', message: 'Date requise' });
  } else if (!validateDate(formData.date)) {
    errors.push({ field: 'date', message: 'Format de date invalide' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Patient profile validation
export const validatePatientProfile = (formData: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  bloodType?: string;
}): FormValidationResult => {
  const errors: ValidationError[] = [];

  if (!formData.firstName.trim()) {
    errors.push({ field: 'firstName', message: 'Le prénom est requis' });
  }

  if (!formData.lastName.trim()) {
    errors.push({ field: 'lastName', message: 'Le nom est requis' });
  }

  if (!formData.email.trim()) {
    errors.push({ field: 'email', message: 'L\'email est requis' });
  } else if (!validateEmail(formData.email)) {
    errors.push({ field: 'email', message: 'Format d\'email invalide' });
  }

  if (formData.phone && !validatePhone(formData.phone)) {
    errors.push({ field: 'phone', message: 'Format de téléphone invalide' });
  }

  if (formData.birthDate && !validateDate(formData.birthDate)) {
    errors.push({ field: 'birthDate', message: 'Format de date de naissance invalide' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Note validation
export const validateNote = (formData: {
  title: string;
  content: string;
  patientId: string;
  doctorId: string;
}): FormValidationResult => {
  const errors: ValidationError[] = [];

  if (!formData.title.trim()) {
    errors.push({ field: 'title', message: 'Le titre est requis' });
  }

  if (!formData.content.trim()) {
    errors.push({ field: 'content', message: 'Le contenu est requis' });
  }

  if (!formData.patientId) {
    errors.push({ field: 'patientId', message: 'Patient requis' });
  }

  if (!formData.doctorId) {
    errors.push({ field: 'doctorId', message: 'Médecin requis' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generic form validation helper
export const hasValidationErrors = (result: FormValidationResult): boolean => {
  return !result.isValid;
};

// Get first error for a specific field
export const getFieldError = (errors: ValidationError[], fieldName: string): string | null => {
  const fieldError = errors.find(error => error.field === fieldName);
  return fieldError ? fieldError.message : null;
};