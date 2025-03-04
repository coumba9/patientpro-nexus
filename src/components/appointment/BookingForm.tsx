import { Button } from "@/components/ui/button";
import {
  Form,
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
import { Calendar } from "@/components/ui/calendar";
import { fr } from "date-fns/locale";
import { Euro, CreditCard, Building, MapPin, Video, Phone, Wallet, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface BookingFormProps {
  doctorName?: string | null;
  specialty?: string | null;
  doctorFees: {
    consultation: number;
    followup: number;
    urgent: number;
  };
  onSubmit: (data: BookingFormValues) => void;
}

interface BookingFormValues {
  date: Date;
  time: string;
  type: string;
  consultationType: "presentiel" | "teleconsultation";
  paymentMethod: string;
}

export const BookingForm = ({
  doctorName,
  specialty,
  doctorFees,
  onSubmit,
}: BookingFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [consultationType, setConsultationType] = useState("consultation");
  const [isOnline, setIsOnline] = useState(false);
  const [isPendingPayment, setIsPendingPayment] = useState(false);
  const navigate = useNavigate();

  const form = useForm<BookingFormValues>({
    defaultValues: {
      type: "consultation",
      consultationType: "presentiel",
      paymentMethod: "card",
    },
  });

  useEffect(() => {
    const pendingAppointment = localStorage.getItem("pendingAppointment");
    if (pendingAppointment) {
      try {
        const appointmentData = JSON.parse(pendingAppointment);
        if (appointmentData.doctorName === doctorName && appointmentData.specialty === specialty) {
          setIsPendingPayment(true);
          
          form.setValue("type", appointmentData.type);
          form.setValue("consultationType", appointmentData.consultationType);
          form.setValue("date", new Date(appointmentData.date));
          form.setValue("time", appointmentData.time);
          form.setValue("paymentMethod", appointmentData.paymentMethod);
          
          setConsultationType(appointmentData.type);
          setIsOnline(appointmentData.consultationType === "teleconsultation");
          setSelectedDate(new Date(appointmentData.date));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du rendez-vous en attente:", error);
        localStorage.removeItem("pendingAppointment");
      }
    }
  }, [doctorName, specialty, form]);

  const handleConfirmPayment = () => {
    const pendingAppointment = localStorage.getItem("pendingAppointment");
    if (!pendingAppointment) return;
    
    try {
      const appointmentData = JSON.parse(pendingAppointment);
      toast.success("Paiement confirmé! Votre rendez-vous a été enregistré.");
      localStorage.removeItem("pendingAppointment");
      navigate("/patient");
    } catch (error) {
      toast.error("Erreur lors de la confirmation du paiement.");
      console.error(error);
    }
  };

  const availableTimeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
  ];

  return (
    <>
      {isPendingPayment ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h3 className="text-amber-800 font-medium mb-2">Paiement en attente</h3>
          <p className="text-amber-700 mb-4">Vous avez un paiement en attente pour ce rendez-vous. Veuillez confirmer que vous avez effectué le paiement via {form.getValues("paymentMethod") === "wave" ? "Wave" : form.getValues("paymentMethod") === "orange-money" ? "Orange Money" : "Mobile Money"}.</p>
          <Button 
            onClick={handleConfirmPayment}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            J'ai effectué le paiement
          </Button>
        </div>
      ) : null}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de consultation</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setConsultationType(value);
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

          <FormField
            control={form.control}
            name="consultationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mode de consultation</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setIsOnline(value === "teleconsultation");
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
                    setSelectedDate(date);
                  }}
                  locale={fr}
                  disabled={(date) =>
                    date < new Date() || date.getDay() === 0
                  }
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horaire</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!selectedDate}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un horaire" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableTimeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moyen de paiement</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un moyen de paiement" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Total à payer :</span>
              <span className="text-xl font-bold">
                {doctorFees[consultationType as keyof typeof doctorFees]} CFA
              </span>
            </div>
            <Button type="submit" className="w-full">
              Confirmer et payer
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
