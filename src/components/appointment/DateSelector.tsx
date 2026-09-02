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
import {
  computeAvailableSlots,
  parseLocalDateString,
  toLocalDateString,
  WEEKDAYS_FR,
} from "@/lib/availability";

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
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set());
  const locationId = form.watch("locationId");
  const durationMinutes = form.watch("durationMinutes") || 30;

  useEffect(() => {
    if (!doctorId) {
      setWorkingDays(null);
      setBlockedDates(new Set());
      setUnavailableDates(new Set());
      return;
    }

    let active = true;
    const load = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeMonthsLater = new Date(today);
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

      const startDate = toLocalDateString(today);
      const endDate = toLocalDateString(threeMonthsLater);
      const [slotsRes, unavailRes, apptRes] = await Promise.all([
        supabase
          .from("doctor_availability_slots")
          .select("day, start_time, end_time, location_id")
          .eq("doctor_id", doctorId),
        supabase
          .from("doctor_unavailability_periods")
          .select("start_date, end_date, start_time, end_time, is_full_day")
          .eq("doctor_id", doctorId)
          .gte("end_date", startDate)
          .lte("start_date", endDate),
        supabase
          .from("appointments")
          .select("date, time, duration_minutes")
          .eq("doctor_id", doctorId)
          .neq("status", "cancelled")
          .gte("date", startDate)
          .lte("date", endDate),
      ]);

      if (!active) return;

      const ranges = (slotsRes.data || []) as any[];
      const periods = (unavailRes.data || []) as any[];
      const appointments = (apptRes.data || []) as any[];
      setWorkingDays(new Set(ranges.map((slot) => slot.day)));

      const fullyBlocked = new Set<string>();
      periods
        .filter((period) => period.is_full_day)
        .forEach((period) => {
          let cursor = parseLocalDateString(period.start_date);
          const end = parseLocalDateString(period.end_date);
          while (cursor <= end) {
            fullyBlocked.add(toLocalDateString(cursor));
            cursor.setDate(cursor.getDate() + 1);
          }
        });
      setBlockedDates(fullyBlocked);

      // Un jour est aussi désactivé si tous ses créneaux sont occupés ou trop courts.
      const noSlotDates = new Set<string>();
      for (let cursor = new Date(today); cursor <= threeMonthsLater; cursor.setDate(cursor.getDate() + 1)) {
        const dateStr = toLocalDateString(cursor);
        const dayRanges = ranges.filter((range) => range.day === WEEKDAYS_FR[cursor.getDay()]);
        const dayPeriods = periods.filter(
          (period) => period.start_date <= dateStr && period.end_date >= dateStr
        );
        const dayAppointments = appointments.filter((appointment) => appointment.date === dateStr);
        const slots = computeAvailableSlots({
          ranges: dayRanges,
          unavailability: dayPeriods,
          booked: dayAppointments,
          durationMinutes,
          selectedDate: cursor,
          locationId,
        });
        if (slots.length === 0) noSlotDates.add(dateStr);
      }
      setUnavailableDates(noSlotDates);
    };

    void load();
    return () => {
      active = false;
    };
  }, [doctorId, locationId, durationMinutes]);

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    const dateStr = toLocalDateString(date);
    if (blockedDates.has(dateStr) || unavailableDates.has(dateStr)) return true;

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
          {selectedDate && isDateDisabled(selectedDate) && (
            <p className="text-xs text-muted-foreground">
              Aucun créneau ne correspond à la durée choisie pour cette date.
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
