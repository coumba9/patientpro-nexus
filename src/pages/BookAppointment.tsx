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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Euro, CreditCard, Building, Info, MapPin, Video } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BookingFormValues {
  date: Date;
  time: string;
  type: string;
  consultationType: "presentiel" | "teleconsultation";
  paymentMethod: string;
}

interface DoctorInfo {
  name: string;
  specialty: string;
  fees: {
    consultation: number;
    followup: number;
    urgent: number;
  };
  languages: string[];
  experience: string;
  education: string;
  conventions: string;
}

export const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const doctorName = searchParams.get("doctor");
  const specialty = searchParams.get("specialty");
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [consultationType, setConsultationType] = useState("consultation");
  const [isOnline, setIsOnline] = useState(false);

  // Exemple d'informations du médecin
  const doctorInfo: DoctorInfo = {
    name: doctorName || "Dr. Non spécifié",
    specialty: specialty || "Non spécifié",
    fees: {
      consultation: 50,
      followup: 35,
      urgent: 70,
    },
    languages: ["Français", "Anglais"],
    experience: "15 ans",
    education: "Faculté de Médecine de Paris",
    conventions: "Secteur 1 - Conventionné",
  };

  const form = useForm<BookingFormValues>({
    defaultValues: {
      type: "consultation",
      consultationType: "presentiel",
      paymentMethod: "card",
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
      <div className="container max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Informations du médecin */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations du médecin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">{doctorInfo.name}</h3>
                  <p className="text-gray-600">{doctorInfo.specialty}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Expérience</p>
                  <p className="text-gray-600">{doctorInfo.experience}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Formation</p>
                  <p className="text-gray-600">{doctorInfo.education}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Langues parlées</p>
                  <p className="text-gray-600">{doctorInfo.languages.join(", ")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Convention</p>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-600">{doctorInfo.conventions}</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Les tarifs sont conventionnés avec la sécurité sociale</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tarifs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Tarif</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Consultation</TableCell>
                      <TableCell className="text-right">{doctorInfo.fees.consultation}€</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Suivi</TableCell>
                      <TableCell className="text-right">{doctorInfo.fees.followup}€</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Urgence</TableCell>
                      <TableCell className="text-right">{doctorInfo.fees.urgent}€</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Formulaire de réservation */}
          <div className="md:col-span-2">
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
                    {/* Type de consultation */}
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
                                Première consultation ({doctorInfo.fees.consultation}€)
                              </SelectItem>
                              <SelectItem value="followup">
                                Consultation de suivi ({doctorInfo.fees.followup}€)
                              </SelectItem>
                              <SelectItem value="urgent">
                                Urgence ({doctorInfo.fees.urgent}€)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Mode de consultation */}
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

                    {/* Date et heure */}
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

                    {/* Paiement */}
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
                          {doctorInfo.fees[consultationType as keyof typeof doctorInfo.fees]}€
                        </span>
                      </div>
                      <Button type="submit" className="w-full">
                        Confirmer et payer
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
