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
  // Séparer les rendez-vous à venir et passés
  const now = new Date();
  
  const upcomingAppointments = appointments.filter(apt => {
    const appointmentDateTime = new Date(`${apt.date}T${apt.time}`);
    return appointmentDateTime >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
  });

  const pastAppointments = appointments.filter(apt => {
    const appointmentDateTime = new Date(`${apt.date}T${apt.time}`);
    return appointmentDateTime < now || apt.status === 'completed' || apt.status === 'cancelled';
  });

  return (
    <div className="space-y-6">
      {/* Rendez-vous à venir */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Mes prochains rendez-vous</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {upcomingAppointments.length} rendez-vous à venir
            </p>
          </div>
          <Link to="/find-doctor">
            <Button>Prendre un rendez-vous</Button>
          </Link>
        </div>
        <div className="space-y-4">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onSendMessage={onSendMessage}
                onReschedule={onReschedule}
                onConfirm={onConfirm}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucun rendez-vous à venir. Prenez rendez-vous avec un médecin.
            </div>
          )}
        </div>
      </div>

      {/* Rendez-vous passés */}
      {pastAppointments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">Historique</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {pastAppointments.length} rendez-vous passé{pastAppointments.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="space-y-4 opacity-75">
            {pastAppointments.slice(0, 5).map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onSendMessage={onSendMessage}
                onReschedule={onReschedule}
                onConfirm={onConfirm}
              />
            ))}
            {pastAppointments.length > 5 && (
              <div className="text-center pt-4">
                <Link to="/patient/appointments">
                  <Button variant="outline" size="sm">
                    Voir tout l'historique ({pastAppointments.length})
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
