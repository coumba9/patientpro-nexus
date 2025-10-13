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

interface RescheduleAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  patientName: string;
  currentDate: string;
  currentTime: string;
  doctorId: string;
  onReschedule: () => void;
}

export const RescheduleAppointmentDialog = ({
  isOpen,
  onClose,
  appointmentId,
  patientName,
  currentDate,
  currentTime,
  doctorId,
  onReschedule,
}: RescheduleAppointmentDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedDate && doctorId) {
      loadAvailableSlots();
    }
  }, [selectedDate, doctorId]);

  const loadAvailableSlots = async () => {
    if (!selectedDate) return;
    
    setIsLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const slots = await appointmentService.getAvailableSlots(doctorId, dateStr);
      setAvailableSlots(slots);
      setSelectedTime("");
    } catch (error) {
      console.error("Error loading slots:", error);
      toast.error("Erreur lors du chargement des créneaux");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Veuillez sélectionner une date et une heure");
      return;
    }

    setIsLoading(true);
    try {
      const newDate = format(selectedDate, 'yyyy-MM-dd');
      await appointmentService.rescheduleAppointment(
        appointmentId,
        newDate,
        selectedTime,
        doctorId,
        'doctor'
      );

      toast.success("Rendez-vous reporté avec succès");
      onReschedule();
      onClose();
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast.error("Erreur lors du report du rendez-vous");
    } finally {
      setIsLoading(false);
    }
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
            Reporter le rendez-vous avec {patientName} prévu le {currentDate} à {currentTime}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>
              <CalendarIcon className="inline h-4 w-4 mr-2" />
              Sélectionnez une nouvelle date
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleReschedule} 
            disabled={!selectedDate || !selectedTime || isLoading}
          >
            {isLoading ? "Report en cours..." : "Confirmer le report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};