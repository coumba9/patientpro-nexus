
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

interface DateSelectorProps {
  form: UseFormReturn<BookingFormValues>;
  onDateChange: (date: Date | undefined) => void;
  selectedDate: Date | undefined;
}

export const DateSelector = ({
  form,
  onDateChange,
  selectedDate,
}: DateSelectorProps) => {
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
            disabled={(date) => date < new Date() || date.getDay() === 0}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
