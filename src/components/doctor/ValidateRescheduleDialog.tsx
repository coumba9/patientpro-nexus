import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { appointmentService } from "@/api";
import { Calendar, Clock } from "lucide-react";

interface ValidateRescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  patientName: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
  reason: string;
  onValidate: () => void;
}

export const ValidateRescheduleDialog = ({
  isOpen,
  onClose,
  appointmentId,
  patientName,
  oldDate,
  oldTime,
  newDate,
  newTime,
  reason,
  onValidate,
}: ValidateRescheduleDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      // Accepter le report en mettant à jour le statut
      await appointmentService.updateAppointmentStatus(appointmentId, 'confirmed');
      toast.success("Report accepté avec succès");
      onValidate();
      onClose();
    } catch (error) {
      console.error("Error accepting reschedule:", error);
      toast.error("Erreur lors de l'acceptation du report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      // Refuser le report en annulant le rendez-vous
      await appointmentService.cancelAppointment({
        appointment_id: appointmentId,
        reason: "Report refusé par le médecin",
        cancelled_by: "", // Will be set by the service
        cancellation_type: 'doctor'
      });
      toast.success("Report refusé");
      onValidate();
      onClose();
    } catch (error) {
      console.error("Error rejecting reschedule:", error);
      toast.error("Erreur lors du refus du report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Valider le report de rendez-vous</DialogTitle>
          <DialogDescription>
            {patientName} souhaite reporter son rendez-vous
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ancien rendez-vous</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">{new Date(oldDate).toLocaleDateString('fr-FR')}</span>
                <Clock className="h-4 w-4 ml-2" />
                <span className="font-medium">{oldTime}</span>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <p className="text-sm font-medium text-muted-foreground">Nouveau rendez-vous proposé</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                <span className="font-medium text-primary">{new Date(newDate).toLocaleDateString('fr-FR')}</span>
                <Clock className="h-4 w-4 ml-2" />
                <span className="font-medium text-primary">{newTime}</span>
              </div>
            </div>
          </div>

          {reason && (
            <div className="bg-yellow-50 p-3 rounded-md">
              <p className="text-sm font-medium mb-1">Raison du report :</p>
              <p className="text-sm text-muted-foreground">{reason}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Plus tard
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleReject}
            disabled={isLoading}
          >
            Refuser
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={isLoading}
          >
            {isLoading ? "Validation..." : "Accepter le report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
