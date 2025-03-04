
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

  return (
    <>
      {isPendingPayment ? (
        <PendingPaymentNotification
          paymentMethod={form.getValues("paymentMethod")}
          onConfirmPayment={handleConfirmPayment}
        />
      ) : null}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          <PaymentMethodSelector form={form} />

          <PaymentSummary
            consultationType={consultationType}
            doctorFees={doctorFees}
          />
        </form>
      </Form>
    </>
  );
};
