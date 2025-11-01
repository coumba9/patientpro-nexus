
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AppointmentCard } from "./AppointmentCard";

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  type: string;
  status: "confirmed" | "pending";
  doctorId?: string;
}

interface AppointmentListProps {
  appointments: Appointment[];
  onSendMessage: (doctorName: string, message: string) => void;
  onReschedule: (appointmentId: string, newDate: string, newTime: string, reason?: string) => void;
  onConfirm: (appointmentId: string) => void;
}

export const AppointmentList = ({
  appointments,
  onSendMessage,
  onReschedule,
  onConfirm,
}: AppointmentListProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mes prochains rendez-vous</h2>
        <Link to="/find-doctor">
          <Button>Prendre un rendez-vous</Button>
        </Link>
      </div>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onSendMessage={onSendMessage}
            onReschedule={onReschedule}
            onConfirm={onConfirm}
          />
        ))}
      </div>
    </div>
  );
};
