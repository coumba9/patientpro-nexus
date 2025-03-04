
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
import { MapPin, Video } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { BookingFormValues } from "./types";

interface ConsultationModeSelectorProps {
  form: UseFormReturn<BookingFormValues>;
  onIsOnlineChange: (isOnline: boolean) => void;
}

export const ConsultationModeSelector = ({
  form,
  onIsOnlineChange,
}: ConsultationModeSelectorProps) => {
  return (
    <FormField
      control={form.control}
      name="consultationType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Mode de consultation</FormLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              onIsOnlineChange(value === "teleconsultation");
            }}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Choisissez le mode de consultation" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="presentiel">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Consultation en cabinet
                </div>
              </SelectItem>
              <SelectItem value="teleconsultation">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Téléconsultation
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
