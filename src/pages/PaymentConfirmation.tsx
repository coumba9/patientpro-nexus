import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { appointmentService } from "@/api";
import { checkPaymentStatus } from "@/services/paytech";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

// Validation schemas for security
const tokenSchema = z.string().regex(/^[a-zA-Z0-9_-]+$/).max(200).optional();
const paymentMethodSchema = z.enum(["wave", "orange-money", "mobile-money", "card", "free-money"]).optional();

const safeLocalStorageGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeLocalStorageRemove = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore errors
  }
};

const safeJsonParse = <T,>(json: string | null, fallback: T): T => {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
};

const PaymentConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const processedRef = useRef(false);

  // Validate and extract token from URL params
  const rawToken = searchParams.get("token");
  const tokenValidation = tokenSchema.safeParse(rawToken);
  const token = tokenValidation.success ? tokenValidation.data : null;
  
  // Validate payment method
  const rawMethod = searchParams.get("method") || searchParams.get("methods") || searchParams.get("payment_method") || searchParams.get("channel") || safeLocalStorageGet("paytech_last_method");
  const methodValidation = paymentMethodSchema.safeParse(rawMethod);
  const method = methodValidation.success ? methodValidation.data : null;

  useEffect(() => {
    const verifyPayment = async () => {
      toast.dismiss();

      // Wait for auth to load
      if (authLoading) {
        return;
      }

      // Prevent multiple runs of this effect
      if (processedRef.current) {
        return;
      }
      processedRef.current = true;

      // Token lookup with validation
      let paymentToken = token ||
        tokenSchema.safeParse(searchParams.get("payment_token")).data ||
        tokenSchema.safeParse(searchParams.get("transaction_id")).data ||
        tokenSchema.safeParse(searchParams.get("ref")).data ||
        tokenSchema.safeParse(searchParams.get("reference")).data ||
        tokenSchema.safeParse(searchParams.get("payment_id")).data ||
        tokenSchema.safeParse(safeLocalStorageGet("paytech_last_token")).data;
        
      const isSandbox = safeLocalStorageGet("paytech_last_env") === "test";
      const proceedWithoutToken = !paymentToken && !!safeLocalStorageGet("pendingAppointment");

      if (!user) {
        console.error("User not authenticated");
        setStatus("error");
        toast.error("Utilisateur non authentifié");
        return;
      }

      // Idempotency guard - create early lock to avoid duplicate creations
      let idempotencyKey: string | null = paymentToken ? `appointment_created_${paymentToken}` : null;
      if (idempotencyKey) {
        try {
          const flag = localStorage.getItem(idempotencyKey);
          if (flag === "true") {
            console.log("Appointment already created for this token, showing success");
            setStatus("success");
            toast.success("Rendez-vous déjà confirmé");
            localStorage.removeItem("pendingAppointment");
            try { localStorage.removeItem("paytech_last_token"); } catch {}
            try { localStorage.removeItem("paytech_last_method"); } catch {}
            try { localStorage.removeItem("paytech_last_env"); } catch {}
            try { localStorage.removeItem("paytech_last_amount"); } catch {}
            return;
          }
          if (flag === "processing") {
            console.log("Appointment creation already in progress, skipping duplicate run");
            setStatus("loading");
            return;
          }
          localStorage.setItem(idempotencyKey, "processing");
        } catch (e) {
          console.warn("Unable to set/read idempotency flag:", e);
        }
      }

      // Prevent concurrent execution
      if (isCreating) {
        console.log("Already creating appointment, skipping");
        return;
      }

      try {
        // Récupérer les données de rendez-vous en attente with safe parsing
        const pendingAppointmentRaw = safeLocalStorageGet("pendingAppointment");
        if (!pendingAppointmentRaw) {
          setStatus("error");
          toast.error("Aucune donnée de rendez-vous en attente");
          return;
        }

        const data = safeJsonParse(pendingAppointmentRaw, null);
        if (!data || typeof data !== 'object') {
          setStatus("error");
          toast.error("Données de rendez-vous invalides");
          return;
        }
        setAppointmentData(data);

        // Vérifier le paiement en production avant de créer le rendez-vous
        if (!isSandbox) {
          if (!paymentToken) {
            console.error('Missing payment token in production');
            setStatus('error');
            toast.error('Token de paiement manquant');
            return;
          }
          const verified = await checkPaymentStatus(paymentToken);
          if (!verified) {
            setStatus('error');
            toast.error("Échec de la vérification du paiement");
            return;
          }
        }

        console.log("Creating appointment...");
        setIsCreating(true);

        if (!data.doctorId) {
          console.error("Doctor ID is missing from appointment data");
          setIsCreating(false);
          throw new Error("Doctor ID is required to create appointment");
        }

        try {
          console.log("Creating appointment in Supabase...");

          // Le rendez-vous est automatiquement confirmé car le créneau 
          // a été sélectionné parmi les disponibilités du médecin
          const appointment = await appointmentService.createAppointment({
            doctor_id: data.doctorId,
            patient_id: user.id,
            date: data.date.toISOString ? data.date.toISOString().split('T')[0] : new Date(data.date).toISOString().split('T')[0],
            time: data.time,
            type: data.type,
            mode: data.consultationType,
            status: 'confirmed', // Auto-confirmé car dans les créneaux de disponibilité
            location: data.consultationType === 'presentiel' ? 'Cabinet médical' : 'Téléconsultation',
            notes: data.medicalInfo ? JSON.stringify(data.medicalInfo) : undefined
          });

          console.log("Appointment created successfully");

          // Mettre à jour le numéro de téléphone du patient s'il a été fourni
          if (data.phone) {
            console.log("Updating patient phone number:", data.phone);
            const { supabase } = await import("@/integrations/supabase/client");
            const { error: updateError } = await supabase
              .from('patients')
              .update({ phone_number: data.phone })
              .eq('id', user.id);

            if (updateError) {
              console.error("Error updating patient phone:", updateError);
            } else {
              console.log("Patient phone number updated successfully");
            }
          }

          // Idempotency flag for this token
          if (idempotencyKey) {
            try { localStorage.setItem(idempotencyKey, "true"); } catch {}
          }

          // Nettoyer le localStorage
          safeLocalStorageRemove("pendingAppointment");
          safeLocalStorageRemove("paytech_last_token");
          safeLocalStorageRemove("paytech_last_method");
          safeLocalStorageRemove("paytech_last_env");
          safeLocalStorageRemove("paytech_last_amount");

          setStatus("success");
          toast.success("Rendez-vous créé avec succès !");
          setIsCreating(false);
        } catch (error: any) {
          console.error("Error creating appointment:", error);

          // Fallback: si le créneau est marqué indisponible, vérifier si un rendez-vous existe déjà pour ce créneau
          try {
            const { supabase } = await import("@/integrations/supabase/client");
            const dateStr = data.date.toISOString ? data.date.toISOString().split('T')[0] : new Date(data.date).toISOString().split('T')[0];
            const { data: existing } = await supabase
              .from('appointments')
              .select('*')
              .eq('doctor_id', data.doctorId)
              .eq('patient_id', user.id)
              .eq('date', dateStr)
              .eq('time', data.time)
              .maybeSingle();

            if (existing) {
              // Idempotency flag
              if (idempotencyKey) {
                try { localStorage.setItem(idempotencyKey, "true"); } catch {}
              }
              // Nettoyage et succès
              localStorage.removeItem("pendingAppointment");
              try { localStorage.removeItem("paytech_last_token"); } catch {}
              try { localStorage.removeItem("paytech_last_method"); } catch {}
              try { localStorage.removeItem("paytech_last_env"); } catch {}
              try { localStorage.removeItem("paytech_last_amount"); } catch {}

              setStatus("success");
              toast.success("Rendez-vous confirmé !");
              setIsCreating(false);
              return;
            }
          } catch (fallbackErr) {
            console.warn("Fallback appointment check failed:", fallbackErr);
          }

          setStatus("error");
          setIsCreating(false);

          // Message d'erreur plus clair
          const errorMessage = (error as any)?.message || "Une erreur s'est produite";
          if (errorMessage.includes("créneau")) {
            toast.error("Ce créneau n'est plus disponible. Veuillez en choisir un autre.");
          } else {
            toast.error("Erreur: " + errorMessage);
          }
          return;
        }

      } catch (error) {
        console.error("Erreur lors de la vérification du paiement:", error);
        setStatus("error");
        toast.error("Erreur lors de la vérification du paiement");
      }
    };

    verifyPayment();
  }, [token, method, user, authLoading]);
  
  const getPaymentMethodName = (methodId: string) => {
    const methods: Record<string, string> = {
      "wave": "Wave",
      "orange-money": "Orange Money",
      "mobile-money": "MTN Mobile Money",
      "card": "Carte bancaire"
    };
    return methods[methodId] || methodId;
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Vérification du paiement</h2>
            <p className="text-gray-600">
              Nous vérifions votre paiement, veuillez patienter...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-red-600">
              Erreur lors de la création du rendez-vous
            </h2>
            <p className="text-gray-600 mb-6">
              Le créneau sélectionné n'est plus disponible. Veuillez en choisir un autre.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => navigate(appointmentData ? `/book-appointment?doctor=${encodeURIComponent(appointmentData.doctorName || "")}&specialty=${encodeURIComponent(appointmentData.specialty || "")}` : "/book-appointment")}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Choisir un autre créneau
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full"
              >
                Retour à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl text-green-600">
            Paiement confirmé !
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">
                Votre rendez-vous a été confirmé
              </h3>
              {appointmentData && (
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Médecin:</strong> {appointmentData.doctorName}</p>
                  <p><strong>Spécialité:</strong> {appointmentData.specialty}</p>
                  <p><strong>Type:</strong> {appointmentData.type}</p>
                  <p><strong>Mode:</strong> {appointmentData.consultationType}</p>
                  <p><strong>Date:</strong> {new Date(appointmentData.date).toLocaleDateString()}</p>
                  <p><strong>Heure:</strong> {appointmentData.time}</p>
                </div>
              )}
            </div>

            {method && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Méthode de paiement:</strong> {getPaymentMethodName(method)}
                </p>
              </div>
            )}

            <div className="space-y-2 pt-4">
              <Button
                onClick={() => navigate("/patient")}
                className="w-full"
              >
                Voir mes rendez-vous
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full"
              >
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentConfirmation;
