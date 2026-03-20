
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
  CreditCard,
  Phone,
  Wallet,
  Banknote,
} from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { BookingFormValues } from "./types";
import { getSupportedPaymentMethods } from "@/services/africaPayment";

interface PaymentMethodSelectorProps {
  form: UseFormReturn<BookingFormValues>;
}

export const PaymentMethodSelector = ({
  form,
}: PaymentMethodSelectorProps) => {
  const supportedMethods = getSupportedPaymentMethods();
  
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Wallet": return Wallet;
      case "Phone": return Phone;
      case "CreditCard": return CreditCard;
      default: return CreditCard;
    }
  };

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
              {/* Option paiement sur place */}
              <SelectItem 
                value="on-site"
                className="border-l-4 border-green-500 pl-2 mb-1 bg-green-50"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Payer sur place</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full ml-2">
                    Recommandé
                  </span>
                </div>
              </SelectItem>

              {/* Méthodes de paiement en ligne */}
              {supportedMethods.map((method) => {
                const IconComponent = getIcon(method.icon);
                return (
                  <SelectItem 
                    key={method.id} 
                    value={method.id}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className={`h-4 w-4 text-${method.color}`} />
                      <span>{method.name}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
