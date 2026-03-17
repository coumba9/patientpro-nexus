import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { BookingFormValues } from "./types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface TimeSelectorProps {
  form: UseFormReturn<BookingFormValues>;
  doctorId?: string | null;
  selectedDate: Date | undefined;
}

export const TimeSelector = ({ form, doctorId, selectedDate }: TimeSelectorProps) => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const dateStr = selectedDate.toISOString().split('T')[0];

    if (!doctorId) {
      // Fallback: show all slots if no doctorId
      const allSlots: string[] = [];
      for (let hour = 8; hour < 18; hour++) {
        if (hour >= 12 && hour < 14) continue; // Pause déjeuner
        allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
      setAvailableSlots(allSlots);
      return;
    }

    const fetchSlots = async () => {
      setLoading(true);
      try {
        const { data: bookedAppointments, error } = await supabase
          .from('appointments')
          .select('time')
          .eq('doctor_id', doctorId)
          .eq('date', dateStr)
          .neq('status', 'cancelled');

        if (error) {
          console.error('Error fetching slots:', error);
          setAvailableSlots([]);
          return;
        }

        const bookedTimes = (bookedAppointments || []).map((apt: any) =>
          apt.time?.substring(0, 5)
        );

        // Generate all possible slots (8h-18h, skip lunch 12-14)
        const allSlots: string[] = [];
        for (let hour = 8; hour < 18; hour++) {
          if (hour >= 12 && hour < 14) continue;
          allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
          allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
        }

        // Filter out booked and past slots
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        const available = allSlots.filter(slot => {
          if (bookedTimes.includes(slot)) return false;
          if (dateStr === today) {
            const [h, m] = slot.split(':').map(Number);
            const slotTime = new Date();
            slotTime.setHours(h, m, 0, 0);
            if (slotTime <= now) return false;
          }
          return true;
        });

        setAvailableSlots(available);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();

    // Reset time when date changes
    form.setValue('time', '');
  }, [selectedDate, doctorId]);

  return (
    <FormField
      control={form.control}
      name="time"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Horaire
            {loading && <Loader2 className="inline ml-2 h-4 w-4 animate-spin" />}
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={!selectedDate || loading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={
                  !selectedDate
                    ? "Sélectionnez d'abord une date"
                    : loading
                    ? "Chargement..."
                    : availableSlots.length === 0
                    ? "Aucun créneau disponible"
                    : "Sélectionnez un horaire"
                } />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {availableSlots.length === 0 && !loading ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Aucun créneau disponible pour cette date
                </div>
              ) : (
                availableSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
