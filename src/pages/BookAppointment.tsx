
import { useNavigate, useSearchParams } from "react-router-dom";
import { DoctorInfoCard } from "@/components/appointment/DoctorInfoCard";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { NavigationButtons } from "@/components/appointment/NavigationButtons";
import { AppointmentBookingCard } from "@/components/appointment/AppointmentBookingCard";
import { getDefaultDoctorInfo } from "@/components/appointment/doctorTypes";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const doctorId = searchParams.get("doctorId");
  const doctorName = searchParams.get("doctor");
  const specialty = searchParams.get("specialty");
  const isPending = searchParams.get("pending") === "true";
  const isLoggedIn = !!user;

  // Vérifier si on arrive avec un paramètre pending
  useEffect(() => {
    if (isPending) {
      // Nettoyer l'URL sans rafraîchir la page
      navigate(`/book-appointment?doctor=${encodeURIComponent(doctorName || "")}&specialty=${encodeURIComponent(specialty || "")}`, { replace: true });
      
      // Afficher le message de paiement en attente
      toast.info("Veuillez confirmer votre paiement une fois celui-ci effectué", {
        duration: 5000
      });
    }
  }, [isPending, navigate, doctorName, specialty]);

  const [realFees, setRealFees] = useState<number | null>(null);
  useEffect(() => {
    setRealFees(null);
    if (!user || !doctorId) return;
    let active = true;
    supabase.from('consultation_reasons').select('price').eq('doctor_id', doctorId).eq('is_active', true).then(({data}) => {
      if (active && data?.length && data.every(r => Number(r.price) === Number(data[0].price))) setRealFees(Number(data[0].price));
    });
    return () => { active = false; };
  }, [user, doctorId]);
  const doctorInfo = getDefaultDoctorInfo(doctorName, specialty);
  if (realFees !== null) doctorInfo.fees = {consultation: realFees, followup: realFees, urgent: realFees};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl">
        <NavigationButtons />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Informations du médecin */}
          <div className="md:col-span-1">
            {realFees !== null ? <DoctorInfoCard doctorInfo={doctorInfo} /> : <p className="text-muted-foreground">Les tarifs sont indiqués avec les motifs après connexion.</p>}
          </div>

          {/* Formulaire de réservation ou message de connexion */}
          <div className="md:col-span-2">
            <AppointmentBookingCard
              doctorId={doctorId}
              doctorName={doctorName}
              specialty={specialty}
              isLoggedIn={isLoggedIn}
              doctorInfo={doctorInfo}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
