import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageCircle,
  Calendar,
  Clock,
  MapPin,
  Video,
  CheckCircle,
  User,
  Stethoscope,
  X,
} from "lucide-react";
import { MessageDialog } from "./MessageDialog";
import { RescheduleDialog } from "./RescheduleDialog";
import { CancelAppointmentDialog } from "./CancelAppointmentDialog";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { messageService, appointmentService } from "@/api";
import { Appointment } from "./types";

interface AppointmentCardProps {
  appointment: Appointment;
  onSendMessage: (doctorName: string, message: string) => void;
  onReschedule: (appointmentId: string, newDate: string, newTime: string, reason?: string) => void;
  onConfirm: (appointmentId: string) => void;
}

export const AppointmentCard = ({
  appointment,
  onSendMessage,
  onReschedule,
  onConfirm,
}: AppointmentCardProps) => {
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const { user } = useAuth();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Confirmé</Badge>;
      case "awaiting_patient_confirmation":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">En attente de votre confirmation</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100">Terminé</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Annulé</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">En attente</Badge>;
    }
  };

  const isOnline = appointment.type.toLowerCase().includes('télé');

  const handleRescheduleSubmit = async (appointmentId: string, newDate: string, newTime: string, reason?: string) => {
    try {
      await appointmentService.rescheduleAppointment(appointmentId, newDate, newTime, user?.id || '', 'patient', reason);
      toast.success("Demande de report envoyée au médecin");
      onReschedule(appointmentId, newDate, newTime, reason);
      setIsRescheduleDialogOpen(false);
    } catch (error) {
      console.error("Error rescheduling:", error);
      toast.error("Erreur lors du report du rendez-vous");
    }
  };

  const handleCancelConfirmed = () => {
    // This would trigger the parent component to refresh the appointment list
    setIsCancelDialogOpen(false);
  };

  const handleSendMessage = async (doctorName: string, message: string) => {
    if (!message.trim()) return;
    if (!user?.id) {
      toast.error("Vous devez être connecté pour envoyer un message");
      return;
    }
    if (!appointment.doctorId) {
      toast.error("Impossible de trouver le médecin destinataire");
      return;
    }

    try {
      await messageService.sendMessage({
        sender_id: user.id,
        receiver_id: appointment.doctorId,
        subject: `Message au sujet du rendez-vous du ${appointment.date}`,
        content: message,
        appointment_id: appointment.id,
      } as any);
      toast.success(`Message envoyé au ${doctorName}`);
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">
                  {(appointment as any).doctor?.profile?.first_name && (appointment as any).doctor?.profile?.last_name
                    ? `Dr. ${(appointment as any).doctor.profile.first_name} ${(appointment as any).doctor.profile.last_name}`
                    : appointment.doctor || 'Médecin non spécifié'}
                </h3>
                {getStatusBadge(appointment.status)}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Stethoscope className="h-4 w-4" />
                  <span>
                    {(appointment as any).doctor?.specialty?.name || appointment.specialty || 'Spécialité non spécifiée'}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(appointment.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isOnline ? (
                      <>
                        <Video className="h-4 w-4" />
                        <span>Téléconsultation</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4" />
                        <span>{appointment.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMessageDialogOpen(true)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contacter
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRescheduleDialogOpen(true)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Reporter
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-600"
                onClick={() => setIsCancelDialogOpen(true)}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>

              {appointment.status === "awaiting_patient_confirmation" && (
                <Button
                  size="sm"
                  onClick={() => onConfirm(appointment.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmer
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <MessageDialog
        isOpen={isMessageDialogOpen}
        onClose={() => setIsMessageDialogOpen(false)}
        doctorName={appointment.doctor}
        onSendMessage={handleSendMessage}
      />

      <RescheduleDialog
        isOpen={isRescheduleDialogOpen}
        onClose={() => setIsRescheduleDialogOpen(false)}
        appointment={appointment}
        onReschedule={handleRescheduleSubmit}
      />

      <CancelAppointmentDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        appointmentId={appointment.id}
        doctorName={appointment.doctor}
        appointmentTime={appointment.time}
        appointmentDate={appointment.date}
        userId={user?.id || ''}
        onCancel={handleCancelConfirmed}
      />
    </>
  );
};
