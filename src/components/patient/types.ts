export interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  type: string;
  status: "confirmed" | "pending" | "awaiting_patient_confirmation" | "cancelled" | "completed";
  doctorId?: string;
}
