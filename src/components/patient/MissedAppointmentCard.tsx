import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  MessageCircle,
  RotateCcw
} from "lucide-react";
import { RescheduleDialog } from "./RescheduleDialog";
import { MessageDialog } from "./MessageDialog";
import { Appointment } from "./types";

interface MissedAppointmentCardProps {
  appointment: Appointment;
  canReschedule: boolean;
  penaltyPercentage: number;
  onReschedule: (appointmentId: string, newDate: string, newTime: string, reason?: string) => void;
  onSendMessage: (doctorName: string, message: string) => void;
}

export const MissedAppointmentCard = ({
  appointment,
  canReschedule,
  penaltyPercentage,
  onReschedule,
  onSendMessage
}: MissedAppointmentCardProps) => {
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  const handleReschedule = (appointmentId: string, newDate: string, newTime: string, reason?: string) => {
    onReschedule(appointmentId, newDate, newTime, reason);
    setIsRescheduleDialogOpen(false);
  };

  return (
    <>
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-lg">
                    Dr. {(appointment as any).doctor?.profile?.first_name} {(appointment as any).doctor?.profile?.last_name}
                  </h3>
                  <Badge variant="destructive">Rendez-vous manqué</Badge>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(appointment.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{appointment.time}</span>
                  </div>
                  {appointment.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{appointment.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!canReschedule && (
              <Alert variant="destructive">
                <AlertDescription>
                  Le délai de reprogrammation est dépassé. Le montant de la consultation ne peut plus être remboursé.
                </AlertDescription>
              </Alert>
            )}

            {canReschedule && penaltyPercentage > 0 && (
              <Alert>
                <AlertDescription>
                  Une pénalité de {penaltyPercentage}% sera appliquée en cas de reprogrammation.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {canReschedule && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsRescheduleDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reprogrammer
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMessageDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Contacter le médecin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <RescheduleDialog
        isOpen={isRescheduleDialogOpen}
        onClose={() => setIsRescheduleDialogOpen(false)}
        appointment={appointment}
        onReschedule={handleReschedule}
      />

      <MessageDialog
        isOpen={isMessageDialogOpen}
        onClose={() => setIsMessageDialogOpen(false)}
        doctorName={appointment.doctor}
        onSendMessage={onSendMessage}
      />
    </>
  );
};
