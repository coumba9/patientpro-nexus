import { Calendar } from "@/components/ui/calendar";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { fr } from "date-fns/locale";
import { UseFormReturn } from "react-hook-form";
import { BookingFormValues } from "./types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toLocalDateString, WEEKDAYS_FR } from "@/lib/availability";

interface DateSelectorProps {
  form: UseFormReturn<BookingFormValues>;
  doctorId?: string | null;
  onDateChange: (date: Date | undefined) => void;
  selectedDate: Date | undefined;
}

export const DateSelector = ({
  form,
  doctorId,
  onDateChange,
  selectedDate,
}: DateSelectorProps) => {
  const [workingDays, setWorkingDays] = useState<Set<string> | null>(null);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!doctorId) {
      setWorkingDays(null);
      setBlockedDates(new Set());
      return;
    }

    const load = async () => {
      const today = new Date();
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

      const startDate = toLocalDateString(today);
      const endDate = toLocalDateString(threeMonthsLater);

      const [slotsRes, unavailRes] = await Promise.all([
        supabase
          .from("doctor_availability_slots")
          .select("day")
          .eq("doctor_id", doctorId),
        supabase
          .from("doctor_unavailability_periods")
          .select("start_date, end_date, is_full_day")
          .eq("doctor_id", doctorId)
          .gte("end_date", startDate)
          .lte("start_date", endDate),
      ]);

      setWorkingDays(new Set((slotsRes.data || []).map((s: any) => s.day)));

      // Jours entièrement bloqués (congés / absences)
      const blocked = new Set<string>();
      (unavailRes.data || [])
        .filter((u: any) => u.is_full_day)
        .forEach((u: any) => {
          const cursor = new Date(`${u.start_date}T00:00:00`);
          const end = new Date(`${u.end_date}T00:00:00`);
          while (cursor <= end) {
            blocked.add(toLocalDateString(cursor));
            cursor.setDate(cursor.getDate() + 1);
          }
        });
      setBlockedDates(blocked);
    };

    load();
  }, [doctorId]);

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    const dateStr = toLocalDateString(date);
    if (blockedDates.has(dateStr)) return true;

    // Jours où le médecin n'a défini aucun horaire
    if (workingDays && workingDays.size > 0 && !workingDays.has(WEEKDAYS_FR[date.getDay()])) {
      return true;
    }

    return false;
  };

  return (
    <FormField
      control={form.control}
      name="date"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Date du rendez-vous</FormLabel>
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={(date) => {
              field.onChange(date);
              onDateChange(date);
            }}
            locale={fr}
            disabled={isDateDisabled}
          />
          {workingDays && workingDays.size === 0 && (
            <p className="text-xs text-muted-foreground">
              Ce médecin n'a pas encore publié ses horaires de consultation.
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
