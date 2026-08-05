import { useEffect, useState } from "react";
import {
  FormControl,
  FormDescription,
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
import { supabase } from "@/integrations/supabase/client";

interface Location {
  id: string;
  name: string;
  address: string;
  city: string | null;
  type: string;
  is_primary: boolean;
}

interface Reason {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  allows_teleconsultation: boolean;
}

interface Props {
  form: UseFormReturn<BookingFormValues>;
  doctorId?: string | null;
  isTeleconsultation: boolean;
  onReasonChange?: (reason: { id: string; duration: number; price: number } | null) => void;
}

export const LocationReasonSelector = ({
  form,
  doctorId,
  isTeleconsultation,
  onReasonChange,
}: Props) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [reasons, setReasons] = useState<Reason[]>([]);

  useEffect(() => {
    if (!doctorId) return;

    const load = async () => {
      const [{ data: locs }, { data: rs }] = await Promise.all([
        supabase
          .from("practice_locations" as any)
          .select("*")
          .eq("doctor_id", doctorId)
          .eq("is_active", true)
          .order("is_primary", { ascending: false }),
        supabase
          .from("consultation_reasons" as any)
          .select("*")
          .eq("doctor_id", doctorId)
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ]);

      const locList = (locs as any[] as Location[]) || [];
      setLocations(locList);
      setReasons((rs as any[] as Reason[]) || []);

      const primary = locList.find((l) => l.is_primary) || locList[0];
      if (primary && !form.getValues("locationId")) {
        form.setValue("locationId", primary.id);
      }
    };

    load();
  }, [doctorId]);

  const visibleReasons = isTeleconsultation
    ? reasons.filter((r) => r.allows_teleconsultation)
    : reasons;

  return (
    <div className="space-y-6">
      {!isTeleconsultation && locations.length > 0 && (
        <FormField
          control={form.control}
          name="locationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lieu de consultation</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisissez un lieu" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name} — {l.address}
                      {l.city ? `, ${l.city}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Ce médecin exerce sur {locations.length} lieu{locations.length > 1 ? "x" : ""}.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {visibleReasons.length > 0 && (
        <FormField
          control={form.control}
          name="reasonId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motif de consultation</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  const r = visibleReasons.find((x) => x.id === value);
                  onReasonChange?.(
                    r ? { id: r.id, duration: r.duration_minutes, price: Number(r.price) } : null
                  );
                }}
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisissez un motif" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {visibleReasons.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} — {r.duration_minutes} min ·{" "}
                      {Number(r.price).toLocaleString("fr-FR")} FCFA
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                La durée du rendez-vous dépend du motif sélectionné.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};
