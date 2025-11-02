import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { appointmentService } from "@/api";
import { toast } from "sonner";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Appointment } from "./types";

interface RescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onReschedule: (appointmentId: string, newDate: string, newTime: string, reason?: string) => void;
}

export const RescheduleDialog = ({
  isOpen,
  onClose,
  appointment,
  onReschedule,
}: RescheduleDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (selectedDate && appointment.doctorId) {
      loadAvailableSlots();
    }
  }, [selectedDate, appointment.doctorId]);

  const loadAvailableSlots = async () => {
    if (!selectedDate || !appointment.doctorId) return;
    
    setIsLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const slots = await appointmentService.getAvailableSlots(appointment.doctorId, dateStr);
      setAvailableSlots(slots);
      setSelectedTime("");
    } catch (error) {
      console.error("Error loading slots:", error);
      toast.error("Erreur lors du chargement des créneaux");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReschedule = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Veuillez sélectionner une date et une heure");
      return;
    }

    const newDate = format(selectedDate, 'yyyy-MM-dd');
    onReschedule(appointment.id, newDate, selectedTime, reason);
    onClose();
  };

  const formatTimeSlot = (time: string) => {
    return time.substring(0, 5); // "HH:MM"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reporter le rendez-vous</DialogTitle>
          <DialogDescription>
            Choisissez une nouvelle date et heure pour votre rendez-vous avec {appointment.doctor}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>
              <CalendarIcon className="inline h-4 w-4 mr-2" />
              Sélectionnez une date
            </Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date.getDay() === 0}
              locale={fr}
              className="rounded-md border"
            />
          </div>

          {selectedDate && (
            <div className="grid gap-2">
              <Label>Créneaux disponibles le {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}</Label>
              {isLoading ? (
                <div className="text-center py-4">Chargement...</div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Aucun créneau disponible ce jour
                </div>
              ) : (
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedTime === slot ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(slot)}
                      >
                        {formatTimeSlot(slot)}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}

          {selectedDate && selectedTime && (
            <div className="grid gap-2">
              <Label htmlFor="reason">Raison du report (optionnel)</Label>
              <textarea
                id="reason"
                className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Expliquez pourquoi vous souhaitez reporter ce rendez-vous..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleReschedule} 
            disabled={!selectedDate || !selectedTime}
          >
            Confirmer le report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
