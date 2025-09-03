import { useState } from "react";
import { ValidationError, FormValidationResult } from "@/api/interfaces";
import { 
  validateRegistrationForm,
  validateAppointmentForm,
  validateMedicalRecord,
  validatePatientProfile,
  validateNote,
  getFieldError 
} from "@/lib/validation";

interface UseValidationReturn {
  errors: ValidationError[];
  isValid: boolean;
  validateForm: (formData: any, formType: string) => FormValidationResult;
  clearErrors: () => void;
  setFieldError: (field: string, message: string) => void;
  removeFieldError: (field: string) => void;
  getFieldErrors: (field: string) => string[];
  hasFieldError: (field: string) => boolean;
}

export const useValidation = (): UseValidationReturn => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validateForm = (formData: any, formType: string): FormValidationResult => {
    let result: FormValidationResult;

    switch (formType) {
      case 'registration':
        result = validateRegistrationForm(formData);
        break;
      case 'appointment':
        result = validateAppointmentForm(formData);
        break;
      case 'medical-record':
        result = validateMedicalRecord(formData);
        break;
      case 'patient-profile':
        result = validatePatientProfile(formData);
        break;
      case 'note':
        result = validateNote(formData);
        break;
      default:
        result = { isValid: true, errors: [] };
    }

    setErrors(result.errors);
    return result;
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const setFieldError = (field: string, message: string) => {
    setErrors(prev => {
      const filteredErrors = prev.filter(error => error.field !== field);
      return [...filteredErrors, { field, message }];
    });
  };

  const removeFieldError = (field: string) => {
    setErrors(prev => prev.filter(error => error.field !== field));
  };

  const getFieldErrors = (field: string): string[] => {
    return errors.filter(error => error.field === field).map(error => error.message);
  };

  const hasFieldError = (field: string): boolean => {
    return errors.some(error => error.field === field);
  };

  return {
    errors,
    isValid: errors.length === 0,
    validateForm,
    clearErrors,
    setFieldError,
    removeFieldError,
    getFieldErrors,
    hasFieldError
  };
};

// Hook for real-time field validation
export const useFieldValidation = () => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const validateField = (fieldName: string, value: any, rules: string[]): string[] => {
    const errors: string[] = [];

    rules.forEach(rule => {
      switch (rule) {
        case 'required':
          if (!value || (typeof value === 'string' && !value.trim())) {
            errors.push('Ce champ est requis');
          }
          break;
        case 'email':
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push('Format d\'email invalide');
          }
          break;
        case 'password':
          if (value && value.length < 8) {
            errors.push('Le mot de passe doit contenir au moins 8 caractères');
          }
          break;
        case 'phone':
          if (value && !/^(?:(?:\+33|0)[1-9](?:[0-9]{8}))$/.test(value.replace(/\s/g, ''))) {
            errors.push('Format de téléphone invalide');
          }
          break;
        case 'date':
          if (value && isNaN(Date.parse(value))) {
            errors.push('Format de date invalide');
          }
          break;
        case 'time':
          if (value && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
            errors.push('Format d\'heure invalide (HH:MM)');
          }
          break;
        case 'numeric':
          if (value && isNaN(Number(value))) {
            errors.push('Ce champ doit être numérique');
          }
          break;
        case 'min-length-6':
          if (value && value.length < 6) {
            errors.push('Ce champ doit contenir au moins 6 caractères');
          }
          break;
        case 'max-length-50':
          if (value && value.length > 50) {
            errors.push('Ce champ ne peut pas dépasser 50 caractères');
          }
          break;
        case 'positive-number':
          if (value && (isNaN(Number(value)) || Number(value) < 0)) {
            errors.push('Ce champ doit être un nombre positif');
          }
          break;
        case 'years-experience':
          if (value && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 50)) {
            errors.push('Les années d\'expérience doivent être entre 0 et 50');
          }
          break;
      }
    });

    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: errors
    }));

    return errors;
  };

  const clearFieldError = (fieldName: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const hasError = (fieldName: string): boolean => {
    return fieldErrors[fieldName] && fieldErrors[fieldName].length > 0;
  };

  const getError = (fieldName: string): string | null => {
    const errors = fieldErrors[fieldName];
    return errors && errors.length > 0 ? errors[0] : null;
  };

  const getAllErrors = (fieldName: string): string[] => {
    return fieldErrors[fieldName] || [];
  };

  return {
    validateField,
    clearFieldError,
    hasError,
    getError,
    getAllErrors,
    fieldErrors
  };
};