
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { fr } from "date-fns/locale";

interface BookingFormValues {
  date: Date;
  time: string;
  type: string;
}

export const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const doctorName = searchParams.get("doctor");
  const specialty = searchParams.get("specialty");
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date>();

  const form = useForm<BookingFormValues>({
    defaultValues: {
      type: "consultation",
    },
  });

  const onSubmit = (data: BookingFormValues) => {
    console.log("Booking data:", { ...data, doctorName, specialty });
    toast.success("Rendez-vous pris avec succès !");
    navigate("/patient");
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Prendre rendez-vous</CardTitle>
            <CardDescription>
              {doctorName && specialty
                ? `avec ${doctorName} - ${specialty}`
                : "Nouveau rendez-vous"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de consultation</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez le type de consultation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="consultation">
                            Première consultation
                          </SelectItem>
                          <SelectItem value="followup">
                            Consultation de suivi
                          </SelectItem>
                          <SelectItem value="urgent">Urgence</SelectItem>
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

                <Button type="submit" className="w-full">
                  Confirmer le rendez-vous
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookAppointment;
