import { useState } from "react";
import { toast } from "sonner";
import { AppointmentStats } from "./AppointmentStats";
import { AppointmentList } from "./AppointmentList";
import { AppointmentHistoryFilters } from "./AppointmentHistoryFilters";

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  type: string;
  status: "confirmed" | "pending" | "awaiting_patient_confirmation" | "cancelled" | "completed" | "no_show";
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    doctor: "Dr. Sarah Martin",
    specialty: "Cardiologue",
    date: "2024-02-20",
    time: "14:30",
    location: "Paris",
    type: "Consultation",
    status: "pending",
  },
  {
    id: "2",
    doctor: "Dr. Thomas Bernard",
    specialty: "Dermatologue",
    date: "2024-02-25",
    time: "10:00",
    location: "Lyon",
    type: "Suivi",
    status: "confirmed",
  },
];

export const AppointmentsPage = () => {
  const [appointments] = useState<Appointment[]>(mockAppointments);
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredAppointments = appointments.filter(apt => {
    if (activeFilter === "all") return true;
    if (activeFilter === "upcoming") return ["pending", "confirmed", "awaiting_patient_confirmation"].includes(apt.status);
    if (activeFilter === "completed") return apt.status === "completed";
    if (activeFilter === "cancelled") return apt.status === "cancelled";
    if (activeFilter === "no_show") return (apt as any).status === "no_show";
    return true;
  });

  const handleSendMessage = (doctorName: string, message: string) => {
    if (message.trim()) {
      toast.success(`Message envoyé au ${doctorName}`);
    }
  };

const handleReschedule = (appointmentId: string, reason: string) => {
    if (reason.trim()) {
      toast.success("Demande de report envoyée");
    }
  };

const handleConfirm = (appointmentId: string) => {
    toast.success("Rendez-vous confirmé avec succès");
  };

  return (
    <div className="space-y-6">
      <AppointmentStats appointmentsCount={appointments.length} />
      <AppointmentHistoryFilters 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <AppointmentList
        appointments={filteredAppointments}
        onSendMessage={handleSendMessage}
        onReschedule={handleReschedule}
        onConfirm={handleConfirm}
      />
    </div>
  );
};
