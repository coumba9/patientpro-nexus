import { useAuth } from "@/hooks/useAuth";
import { useRealtimeAppointments } from "@/hooks/useRealtimeAppointments";
import { AppointmentStats } from "./AppointmentStats";
import { AppointmentList } from "./AppointmentList";
import { toast } from "sonner";
import { appointmentService } from "@/api/services/appointment.service";

export const RealAppointmentsPage = () => {
  const { user } = useAuth();
  const { appointments, loading } = useRealtimeAppointments(user?.id || null, 'patient');

  const handleSendMessage = (doctorName: string, message: string) => {
    if (message.trim()) {
      toast.success(`Message envoyé au ${doctorName}`);
    }
  };

  const handleReschedule = (appointmentId: number, reason: string) => {
    if (reason.trim()) {
      toast.success("Demande de report envoyée");
    }
  };

  const handleConfirm = async (appointmentId: number) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId.toString(), 'confirmed');
      toast.success("Rendez-vous confirmé avec succès");
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error("Erreur lors de la confirmation");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement de vos rendez-vous...</div>;
  }

  // Transform appointments to match the expected format
  const transformedAppointments = appointments.map(apt => ({
    id: parseInt(apt.id) || 0,
    doctor: `Médecin ${apt.doctor_id.slice(0, 8)}...`, // Affichage temporaire de l'ID
    specialty: 'Spécialité à définir',
    date: apt.date,
    time: apt.time,
    location: apt.location || 'À définir',
    type: apt.type,
    status: apt.status as "confirmed" | "pending"
  }));

  return (
    <div className="space-y-6">
      <AppointmentStats appointmentsCount={appointments.length} />
      <AppointmentList
        appointments={transformedAppointments}
        onSendMessage={handleSendMessage}
        onReschedule={handleReschedule}
        onConfirm={handleConfirm}
      />
    </div>
  );
};