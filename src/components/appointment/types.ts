
export interface BookingFormValues {
  date: Date;
  time: string;
  type: string;
  consultationType: "presentiel" | "teleconsultation";
  paymentMethod: string;
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
