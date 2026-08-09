export interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  type: string;
  status: "confirmed" | "pending" | "pending_reschedule" | "awaiting_patient_confirmation" | "cancelled" | "completed" | "no_show";
  doctorId?: string;
  mode?: string;
}
