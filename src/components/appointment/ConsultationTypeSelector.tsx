
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

interface ConsultationTypeSelectorProps {
  form: UseFormReturn<BookingFormValues>;
  doctorFees: {
    consultation: number;
    followup: number;
    urgent: number;
  };
  onConsultationTypeChange: (value: string) => void;
}

export const ConsultationTypeSelector = ({
  form,
  doctorFees,
  onConsultationTypeChange,
}: ConsultationTypeSelectorProps) => {
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Type de consultation</FormLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              onConsultationTypeChange(value);
            }}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le type de consultation" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="consultation">
                Première consultation ({doctorFees.consultation} CFA)
              </SelectItem>
              <SelectItem value="followup">
                Consultation de suivi ({doctorFees.followup} CFA)
              </SelectItem>
              <SelectItem value="urgent">
                Urgence ({doctorFees.urgent} CFA)
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
