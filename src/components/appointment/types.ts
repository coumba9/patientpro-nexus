
import { MedicalInfoFormValues } from "./MedicalInformationForm";

export interface BookingFormValues {
  date: Date;
  time: string;
  type: string;
  consultationType: "presentiel" | "teleconsultation";
  paymentMethod: string;
  medicalInfo?: MedicalInfoFormValues;
  // Informations patient pour les paiements
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

export interface BookingFormProps {
  doctorName?: string | null;
  specialty?: string | null;
  doctorFees: {
    consultation: number;
    followup: number;
    urgent: number;
  };
  onSubmit: (data: BookingFormValues) => void;
}
