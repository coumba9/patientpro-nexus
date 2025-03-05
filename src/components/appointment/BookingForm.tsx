
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { BookingFormProps, BookingFormValues } from "./types";
import { ConsultationTypeSelector } from "./ConsultationTypeSelector";
import { ConsultationModeSelector } from "./ConsultationModeSelector";
import { DateSelector } from "./DateSelector";
import { TimeSelector } from "./TimeSelector";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { PaymentSummary } from "./PaymentSummary";
import { PendingPaymentNotification } from "./PendingPaymentNotification";
import { MedicalInformationForm, MedicalInfoFormValues } from "./MedicalInformationForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [showMedicalInfo, setShowMedicalInfo] = useState(false);
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfoFormValues | null>(null);
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
        if (
          appointmentData.doctorName === doctorName &&
          appointmentData.specialty === specialty
        ) {
          setIsPendingPayment(true);

          form.setValue("type", appointmentData.type);
          form.setValue("consultationType", appointmentData.consultationType);
          form.setValue("date", new Date(appointmentData.date));
          form.setValue("time", appointmentData.time);
          form.setValue("paymentMethod", appointmentData.paymentMethod);

          setConsultationType(appointmentData.type);
          setIsOnline(appointmentData.consultationType === "teleconsultation");
          setSelectedDate(new Date(appointmentData.date));

          // Restore medical info if available
          if (appointmentData.medicalInfo) {
            setMedicalInfo(appointmentData.medicalInfo);
          }
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du rendez-vous en attente:",
          error
        );
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

  const handleSaveMedicalInfo = (data: MedicalInfoFormValues) => {
    setMedicalInfo(data);
    setShowMedicalInfo(false);
    toast.success("Vos informations médicales ont été enregistrées");
  };

  const handleFormSubmit = (data: BookingFormValues) => {
    // Include medical info with the form data
    const completeData = {
      ...data,
      medicalInfo
    };
    onSubmit(completeData);
  };

  return (
    <>
      {isPendingPayment ? (
        <PendingPaymentNotification
          paymentMethod={form.getValues("paymentMethod")}
          onConfirmPayment={handleConfirmPayment}
        />
      ) : null}

      <Form {...form}>
        <div className="space-y-6">
          <ConsultationTypeSelector
            form={form}
            doctorFees={doctorFees}
            onConsultationTypeChange={setConsultationType}
          />

          <ConsultationModeSelector
            form={form}
            onIsOnlineChange={setIsOnline}
          />

          <DateSelector
            form={form}
            onDateChange={setSelectedDate}
            selectedDate={selectedDate}
          />

          <TimeSelector form={form} selectedDate={selectedDate} />

          {/* Medical Information Card */}
          <Card>
            <CardHeader className="py-4 cursor-pointer" onClick={() => setShowMedicalInfo(!showMedicalInfo)}>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  Informations médicales
                  {medicalInfo ? <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Renseigné</span> : null}
                </CardTitle>
                {showMedicalInfo ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
            
            {showMedicalInfo && (
              <CardContent>
                <MedicalInformationForm 
                  onSave={handleSaveMedicalInfo} 
                  initialData={medicalInfo || {}}
                />
              </CardContent>
            )}
            
            {!showMedicalInfo && medicalInfo && (
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">
                  Vous avez renseigné vos informations médicales.
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowMedicalInfo(true)}
                >
                  Modifier mes informations médicales
                </Button>
              </CardContent>
            )}
            
            {!showMedicalInfo && !medicalInfo && (
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowMedicalInfo(true)}
                >
                  Ajouter mes informations médicales
                </Button>
              </CardContent>
            )}
          </Card>

          <PaymentMethodSelector form={form} />

          <PaymentSummary
            consultationType={consultationType}
            doctorFees={doctorFees}
          />
          
          <Button 
            type="button" 
            className="w-full"
            onClick={form.handleSubmit(handleFormSubmit)}
          >
            Confirmer le rendez-vous
          </Button>
        </div>
      </Form>
    </>
  );
};
