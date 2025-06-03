
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

interface Appointment {
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  type: string;
  status: "confirmed" | "pending";
}

interface AppointmentCardProps {
  appointment: Appointment;
  onSendMessage: (doctorName: string, message: string) => void;
  onReschedule: (appointmentId: number, reason: string) => void;
  onConfirm: (appointmentId: number) => void;
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
  const userId = "patient-id"; // TODO: Get from auth context

  const getStatusBadge = (status: string) => {
    return status === "confirmed" ? (
      <Badge className="bg-green-100 text-green-800">Confirmé</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
    );
  };

  const isOnline = appointment.type.toLowerCase().includes('télé');

  const handleCancelConfirmed = () => {
    // This would trigger the parent component to refresh the appointment list
    setIsCancelDialogOpen(false);
  };

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">{appointment.doctor}</h3>
                {getStatusBadge(appointment.status)}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Stethoscope className="h-4 w-4" />
                  <span>{appointment.specialty}</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{appointment.date}</span>
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

              {appointment.status === "pending" && (
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
        onSendMessage={onSendMessage}
      />

      <RescheduleDialog
        isOpen={isRescheduleDialogOpen}
        onClose={() => setIsRescheduleDialogOpen(false)}
        appointment={appointment}
        onReschedule={onReschedule}
      />

      <CancelAppointmentDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        appointmentId={appointment.id.toString()}
        doctorName={appointment.doctor}
        appointmentTime={appointment.time}
        appointmentDate={appointment.date}
        userId={userId}
        onCancel={handleCancelConfirmed}
      />
    </>
  );
};
