
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
              {supportedMethods.map((method, index) => {
                const IconComponent = getIcon(method.icon);
                const isRecommended = index === 0; // Premier méthode recommandée
                
                return (
                  <SelectItem 
                    key={method.id} 
                    value={method.id}
                    className={isRecommended ? "border-l-4 border-blue-500 pl-2 mb-1 bg-blue-50" : ""}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <IconComponent className={`h-4 w-4 text-${method.color}`} />
                        <span className={isRecommended ? "font-medium" : ""}>{method.name}</span>
                      </div>
                      {isRecommended && (
                        <div className="flex items-center">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mr-1">
                            Recommandé
                          </span>
                          <CheckCircle className="h-3 w-3 text-blue-700" />
                        </div>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
              
              {/* Méthodes de paiement traditionnelles */}
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
