
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
import {
  Building,
  CreditCard,
  Euro,
  Phone,
  Wallet,
  CheckCircle,
} from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { BookingFormValues } from "./types";

interface PaymentMethodSelectorProps {
  form: UseFormReturn<BookingFormValues>;
}

export const PaymentMethodSelector = ({
  form,
}: PaymentMethodSelectorProps) => {
  return (
    <FormField
      control={form.control}
      name="paymentMethod"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Moyen de paiement</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un moyen de paiement" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="paytech" className="border-l-4 border-blue-500 pl-2 mb-1 bg-blue-50">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-700" />
                    <span className="font-medium">PayTech</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mr-1">Recommandé</span>
                    <CheckCircle className="h-3 w-3 text-blue-700" />
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="card">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Carte bancaire
                </div>
              </SelectItem>
              <SelectItem value="wave">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-blue-600" />
                  Wave
                </div>
              </SelectItem>
              <SelectItem value="orange-money">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-orange-500" />
                  Orange Money
                </div>
              </SelectItem>
              <SelectItem value="mobile-money">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-500" />
                  Mobile Money
                </div>
              </SelectItem>
              <SelectItem value="thirdparty">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Tiers payant
                </div>
              </SelectItem>
              <SelectItem value="cash">
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  Espèces
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
