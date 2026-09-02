
import { MedicalInfoFormValues } from "./MedicalInformationForm";

export interface BookingFormValues {
  date: Date;
  time: string;
  type: string;
  consultationType: "presentiel" | "teleconsultation";
  paymentMethod: string;
  medicalInfo?: MedicalInfoFormValues;
  // Lieu d'exercice et motif de consultation (style Doctolib)
  locationId?: string;
  reasonId?: string;
  durationMinutes?: number;
  // Fuseau utilisé pour interpréter les horaires du calendrier
  timeZone?: string;
  // Informations patient pour les paiements
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

export interface BookingFormProps {
  doctorId?: string | null;
  doctorName?: string | null;
  specialty?: string | null;
  doctorFees: {
    consultation: number;
    followup: number;
    urgent: number;
  };
  onSubmit: (data: BookingFormValues) => void;
}
