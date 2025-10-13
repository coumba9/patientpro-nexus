import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video, CheckCircle, XCircle, Clock, Calendar } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRealtimeAppointments } from "@/hooks/useRealtimeAppointments";
import { appointmentService } from "@/api/services/appointment.service";
import { toast } from "sonner";
import { CancelAppointmentDialog } from "./CancelAppointmentDialog";
import { RescheduleAppointmentDialog } from "./RescheduleAppointmentDialog";

interface RealtimeAppointmentsListProps {
  doctorId: string;
}

export const RealtimeAppointmentsList = ({
  doctorId,
}: RealtimeAppointmentsListProps) => {
  const { appointments, loading } = useRealtimeAppointments(doctorId, 'doctor');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const handleConfirm = async (appointmentId: string) => {
    try {
      await appointmentService.confirmAppointment(appointmentId, doctorId);
      toast.success("Rendez-vous confirmé avec succès");
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error("Erreur lors de la confirmation du rendez-vous");
    }
  };

  const openCancelDialog = (appointment: any) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const openRescheduleDialog = (appointment: any) => {
    setSelectedAppointment(appointment);
    setRescheduleDialogOpen(true);
  };

  const handleCancelSuccess = () => {
    setSelectedAppointment(null);
  };

  const handleRescheduleSuccess = () => {
    setSelectedAppointment(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rendez-vous du jour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Afficher tous les rendez-vous à venir, pas seulement ceux d'aujourd'hui
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate >= today && apt.status !== 'cancelled';
  }).sort((a, b) => {
    const dateA = new Date(a.date + 'T' + a.time);
    const dateB = new Date(b.date + 'T' + b.time);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Rendez-vous à venir ({upcomingAppointments.length})</CardTitle>
        <Link to="/doctor/teleconsultation">
          <Button variant="outline" size="sm">
            <Video className="h-4 w-4 mr-2" />
            Espace téléconsultation
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Aucun rendez-vous à venir
              </div>
            ) : (
              upcomingAppointments.map((appointment: any) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {appointment.patient?.profile?.first_name} {appointment.patient?.profile?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(appointment.date).toLocaleDateString('fr-FR')} à {appointment.time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mode: {appointment.mode === 'teleconsultation' ? 'Téléconsultation' : 'Présentiel'}
                    </p>
                    {appointment.notes && (
                      <p className="text-sm text-muted-foreground">
                        Note: {appointment.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        appointment.status === 'confirmed' ? 'default' :
                        appointment.status === 'pending' ? 'secondary' :
                        appointment.status === 'cancelled' ? 'destructive' :
                        'outline'
                      }
                    >
                      {appointment.status === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {appointment.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {appointment.status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                      {appointment.status === 'confirmed' ? 'Confirmé' :
                       appointment.status === 'pending' ? 'En attente' :
                       appointment.status === 'cancelled' ? 'Annulé' :
                       appointment.status}
                    </Badge>
                    <div className="flex gap-1">
                      {appointment.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfirm(appointment.id)}
                          title="Confirmer"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRescheduleDialog(appointment)}
                        title="Reporter"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openCancelDialog(appointment)}
                        title="Annuler"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {selectedAppointment && (
        <>
          <CancelAppointmentDialog
            isOpen={cancelDialogOpen}
            onClose={() => setCancelDialogOpen(false)}
            appointmentId={selectedAppointment.id}
            patientName={`${selectedAppointment.patient?.profile?.first_name} ${selectedAppointment.patient?.profile?.last_name}`}
            appointmentTime={selectedAppointment.time}
            appointmentDate={new Date(selectedAppointment.date).toLocaleDateString('fr-FR')}
            onCancel={handleCancelSuccess}
          />

          <RescheduleAppointmentDialog
            isOpen={rescheduleDialogOpen}
            onClose={() => setRescheduleDialogOpen(false)}
            appointmentId={selectedAppointment.id}
            patientName={`${selectedAppointment.patient?.profile?.first_name} ${selectedAppointment.patient?.profile?.last_name}`}
            currentDate={new Date(selectedAppointment.date).toLocaleDateString('fr-FR')}
            currentTime={selectedAppointment.time}
            doctorId={doctorId}
            onReschedule={handleRescheduleSuccess}
          />
        </>
      )}
    </Card>
  );
};