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

interface DateSelectorProps {
  form: UseFormReturn<BookingFormValues>;
  doctorId?: string | null;
  onDateChange: (date: Date | undefined) => void;
  selectedDate: Date | undefined;
}

const ALL_SLOTS_COUNT = 20; // 8h-18h, 30min intervals = 20 slots

export const DateSelector = ({
  form,
  doctorId,
  onDateChange,
  selectedDate,
}: DateSelectorProps) => {
  const [fullyBookedDates, setFullyBookedDates] = useState<Set<string>>(new Set());

  // Load booked slots for the next 3 months to identify fully booked dates
  useEffect(() => {
    if (!doctorId) return;

    const loadBookedDates = async () => {
      const today = new Date();
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

      const startDate = today.toISOString().split('T')[0];
      const endDate = threeMonthsLater.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('appointments')
        .select('date, time')
        .eq('doctor_id', doctorId)
        .neq('status', 'cancelled')
        .gte('date', startDate)
        .lte('date', endDate);

      if (!error && data) {
        const slotMap: Record<string, number> = {};
        data.forEach((apt: any) => {
          slotMap[apt.date] = (slotMap[apt.date] || 0) + 1;
        });

        const fullDates = new Set<string>();
        Object.entries(slotMap).forEach(([date, count]) => {
          if (count >= ALL_SLOTS_COUNT) fullDates.add(date);
        });
        setFullyBookedDates(fullDates);
      }
    };

    loadBookedDates();
  }, [doctorId]);

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    if (date.getDay() === 0) return true; // Dimanche
    
    const dateStr = date.toISOString().split('T')[0];
    if (fullyBookedDates.has(dateStr)) return true;

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
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
