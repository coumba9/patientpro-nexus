import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video, CheckCircle, XCircle, Clock } from "lucide-react";
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

interface RealtimeAppointmentsListProps {
  doctorId: string;
}

export const RealtimeAppointmentsList = ({
  doctorId,
}: RealtimeAppointmentsListProps) => {
  const { appointments, loading } = useRealtimeAppointments(doctorId, 'doctor');

  const handleConfirm = async (appointmentId: string) => {
    try {
      await appointmentService.confirmAppointment(appointmentId, doctorId);
      toast.success("Rendez-vous confirmé avec succès");
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error("Erreur lors de la confirmation du rendez-vous");
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      await appointmentService.cancelAppointment({
        appointment_id: appointmentId,
        cancelled_by: doctorId,
        reason: "Annulé par le médecin",
        cancellation_type: "doctor"
      });
      toast.success("Rendez-vous annulé avec succès");
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error("Erreur lors de l'annulation du rendez-vous");
    }
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

  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Rendez-vous du jour ({todayAppointments.length})</CardTitle>
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
            {todayAppointments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Aucun rendez-vous pour aujourd'hui
              </div>
            ) : (
              todayAppointments.map((appointment: any) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {appointment.patient?.profile?.first_name} {appointment.patient?.profile?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.time} - {appointment.type}
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
                    {appointment.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfirm(appointment.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancel(appointment.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};