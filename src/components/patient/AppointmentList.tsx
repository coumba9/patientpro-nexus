import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AppointmentCard } from "./AppointmentCard";
import { Appointment } from "./types";

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
    <div className="bg-card rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Vos rendez-vous</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {appointments.length} rendez-vous
          </p>
        </div>
        <Link to="/find-doctor">
          <Button>Prendre un rendez-vous</Button>
        </Link>
      </div>
      
      <div className="space-y-4">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onSendMessage={onSendMessage}
                onReschedule={onReschedule}
                onConfirm={onConfirm}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Aucun rendez-vous trouvé
              </p>
              <Link to="/find-doctor">
                <Button>Prendre un rendez-vous</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };
