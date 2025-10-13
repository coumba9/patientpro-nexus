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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { appointmentService } from "@/api";

interface CancelAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  patientName: string;
  appointmentTime: string;
  appointmentDate: string;
  onCancel: () => void;
}

export const CancelAppointmentDialog = ({
  isOpen,
  onClose,
  appointmentId,
  patientName,
  appointmentTime,
  appointmentDate,
  onCancel,
}: CancelAppointmentDialogProps) => {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error("Veuillez indiquer une raison pour l'annulation");
      return;
    }

    setIsLoading(true);
    
    try {
      // Get current user ID from session
      const { data: { session } } = await import("@/integrations/supabase/client").then(m => m.supabase.auth.getSession());
      if (!session?.user?.id) {
        toast.error("Vous devez être connecté");
        return;
      }

      await appointmentService.cancelAppointment({
        appointment_id: appointmentId,
        reason: reason.trim(),
        cancelled_by: session.user.id,
        cancellation_type: 'doctor'
      });

      toast.success("Rendez-vous annulé avec succès");
      onCancel();
      onClose();
      setReason("");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Erreur lors de l'annulation du rendez-vous");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Annuler le rendez-vous</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir annuler le rendez-vous avec {patientName} 
            prévu le {appointmentDate} à {appointmentTime} ?
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">
              Raison de l'annulation <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Veuillez expliquer la raison de l'annulation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-950 p-3 rounded-md">
            <strong>Note :</strong> Le patient sera automatiquement notifié de l'annulation.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Retour
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCancel}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? "Annulation..." : "Confirmer l'annulation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};