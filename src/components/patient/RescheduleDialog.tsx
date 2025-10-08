
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
interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  type: string;
  status: "confirmed" | "pending";
}
interface RescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onReschedule: (appointmentId: string, reason: string) => void;
}

export const RescheduleDialog = ({
  isOpen,
  onClose,
  appointment,
  onReschedule,
}: RescheduleDialogProps) => {
  const [reason, setReason] = useState("");

  const handleReschedule = () => {
    if (reason.trim()) {
      onReschedule(appointment.id, reason.trim());
      setReason("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reporter le rendez-vous</DialogTitle>
          <DialogDescription>
            Demande de report du rendez-vous avec {appointment.doctor} 
            prévu le {appointment.date} à {appointment.time}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">Raison du report</Label>
            <Textarea
              id="reason"
              placeholder="Expliquez pourquoi vous souhaitez reporter ce rendez-vous..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleReschedule} disabled={!reason.trim()}>
            Demander un report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
