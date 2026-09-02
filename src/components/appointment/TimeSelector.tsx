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
import { toLocalDateString, WEEKDAYS_FR, computeAvailableSlots } from "@/lib/availability";

interface TimeSelectorProps {
  form: UseFormReturn<BookingFormValues>;
  doctorId?: string | null;
  selectedDate: Date | undefined;
}

export const TimeSelector = ({ form, doctorId, selectedDate }: TimeSelectorProps) => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [noSchedule, setNoSchedule] = useState(false);

  const locationId = form.watch("locationId");
  const durationMinutes = form.watch("durationMinutes") || 30;
  const timeZone = form.watch("timeZone");

  useEffect(() => {
    if (!selectedDate || !doctorId) {
      setAvailableSlots([]);
      setNoSchedule(false);
      return;
    }

    const dateStr = toLocalDateString(selectedDate);
    const dayName = WEEKDAYS_FR[selectedDate.getDay()];

    const fetchSlots = async () => {
      setLoading(true);
      try {
        const [slotsRes, unavailRes, apptRes] = await Promise.all([
          supabase
            .from("doctor_availability_slots")
            .select("start_time, end_time, location_id")
            .eq("doctor_id", doctorId)
            .eq("day", dayName),
          supabase
            .from("doctor_unavailability_periods")
            .select("start_date, end_date, start_time, end_time, is_full_day")
            .eq("doctor_id", doctorId)
            .lte("start_date", dateStr)
            .gte("end_date", dateStr),
          supabase
            .from("appointments")
            .select("time, duration_minutes")
            .eq("doctor_id", doctorId)
            .eq("date", dateStr)
            .neq("status", "cancelled"),
        ]);

        // Créneaux récurrents définis par le médecin (filtrés par lieu si choisi)
        const ranges = (slotsRes.data || []) as any[];

        const usable = ranges.filter(
          (s: any) => !locationId || !s.location_id || s.location_id === locationId
        );

        if (usable.length === 0) {
          setNoSchedule(true);
          setAvailableSlots([]);
          return;
        }
        setNoSchedule(false);

        setAvailableSlots(
          computeAvailableSlots({
            ranges: ranges as any,
            unavailability: (unavailRes.data || []) as any,
            booked: (apptRes.data || []) as any,
            durationMinutes,
            selectedDate,
            locationId,
            timeZone,
          })
        );

      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
    form.setValue("time", "");
  }, [selectedDate, doctorId, locationId, durationMinutes, timeZone]);

  const placeholder = !selectedDate
    ? "Sélectionnez d'abord une date"
    : loading
    ? "Chargement..."
    : noSchedule
    ? "Le médecin ne consulte pas ce jour-là"
    : availableSlots.length === 0
    ? "Aucun créneau disponible"
    : "Sélectionnez un horaire";

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
            disabled={!selectedDate || loading || availableSlots.length === 0}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {availableSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!loading && selectedDate && availableSlots.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Créneaux de {durationMinutes} min issus des horaires définis par le médecin.
            </p>
          )}
          {!loading && selectedDate && availableSlots.length === 0 && (
            <p className="text-xs text-muted-foreground">{placeholder}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
