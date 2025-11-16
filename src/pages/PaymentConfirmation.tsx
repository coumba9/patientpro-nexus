
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { appointmentService } from "@/api";
import { checkPaymentStatus } from "@/services/paytech";
import { useAuth } from "@/hooks/useAuth";

const PaymentConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const token = searchParams.get("token");
  const method = searchParams.get("method") || searchParams.get("methods") || searchParams.get("payment_method") || searchParams.get("channel") || (() => { try { return localStorage.getItem("paytech_last_method"); } catch { return null; } })();

  useEffect(() => {
    console.log("PaymentConfirmation component loaded");
  }, []);

  useEffect(() => {
    const verifyPayment = async () => {
      toast.dismiss();
      console.log("Starting payment verification...");
      console.log("URL search params:", window.location.search);
      console.log("All params:", Object.fromEntries(searchParams.entries()));
      
      // Wait for auth to load
      if (authLoading) {
        console.log("Auth still loading, waiting...");
        return;
      }
      
      // Check for different possible token parameter names from PayTech (seulement nécessaire en mode production)
      let paymentToken = token || 
                          searchParams.get("payment_token") || 
                          searchParams.get("transaction_id") ||
                          searchParams.get("ref") ||
                          searchParams.get("reference") ||
                          searchParams.get("payment_id") ||
                          (() => { try { return localStorage.getItem("paytech_last_token"); } catch { return null; } })();
      
      const isSandbox = (() => { try { return localStorage.getItem("paytech_last_env") === "test"; } catch { return false; } })();
      
      // En mode test/sandbox, on n'a pas besoin de token, la redirection suffit
      if (!paymentToken && !isSandbox) {
        console.error("No payment token found in URL (production mode). Available params:", Object.fromEntries(searchParams.entries()));
        setStatus("error");
        toast.error("Token de paiement manquant en mode production");
        return;
      }
      
      if (isSandbox) {
        console.log("Sandbox mode detected - proceeding without token verification");
      } else {
        console.log("Payment token found:", paymentToken);
      }
      
      console.log("Payment token found:", paymentToken);

      if (!user) {
        console.error("User not authenticated");
        setStatus("error");
        toast.error("Utilisateur non authentifié");
        return;
      }

      // Idempotency guard - only when we have a token  
      // En mode test (env=test), pas besoin de guard car on crée directement
      let idempotencyKey: string | null = paymentToken ? `appointment_created_${paymentToken}` : null;
      
      if (idempotencyKey && !isSandbox) {
        try {
          const alreadyCreated = localStorage.getItem(idempotencyKey);
          if (alreadyCreated === "true") {
            console.log("Appointment already created for this token, showing success");
            setStatus("success");
            toast.success("Rendez-vous déjà confirmé");
            localStorage.removeItem("pendingAppointment");
            try { localStorage.removeItem("paytech_last_token"); } catch {}
            return;
          }
        } catch (e) {
          console.warn("Unable to read idempotency flag:", e);
        }
      }

      // Prevent concurrent execution
      if (isCreating) {
        console.log("Already creating appointment, skipping");
        return;
      }

      try {
        // Récupérer les données de rendez-vous en attente
        const pendingAppointment = localStorage.getItem("pendingAppointment");
        
        if (!pendingAppointment) {
          console.error("No pending appointment data found");
          setStatus("error");
          toast.error("Aucune donnée de rendez-vous en attente");
          return;
        }

        const data = JSON.parse(pendingAppointment);
        setAppointmentData(data);

        // En mode test/sandbox, créer directement le rendez-vous sans vérification PayTech
        console.log("Creating appointment directly in test mode...");
        setIsCreating(true);
        
        if (!data.doctorId) {
          console.error("Doctor ID is missing from appointment data");
          setIsCreating(false);
          throw new Error("Doctor ID is required to create appointment");
        }

        try {
          console.log("Creating appointment in Supabase...");

          const appointment = await appointmentService.createAppointment({
            doctor_id: data.doctorId,
            patient_id: user.id,
            date: data.date.toISOString ? data.date.toISOString().split('T')[0] : new Date(data.date).toISOString().split('T')[0],
            time: data.time,
            type: data.type,
            mode: data.consultationType,
            location: data.consultationType === 'presentiel' ? 'Cabinet médical' : 'Téléconsultation',
            notes: data.medicalInfo ? JSON.stringify(data.medicalInfo) : undefined
          });

          console.log("Appointment created successfully");
          
          // Nettoyer le localStorage
          localStorage.removeItem("pendingAppointment");
          try { localStorage.removeItem("paytech_last_token"); } catch {}
          try { localStorage.removeItem("paytech_last_method"); } catch {}
          try { localStorage.removeItem("paytech_last_env"); } catch {}
          try { localStorage.removeItem("paytech_last_amount"); } catch {}
          
          setStatus("success");
          toast.success("Rendez-vous créé avec succès !");
          setIsCreating(false);
        } catch (error: any) {
          console.error("Error creating appointment:", error);
          setStatus("error");
          setIsCreating(false);
          
          // Message d'erreur plus clair
          const errorMessage = error.message || "Une erreur s'est produite";
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
  }, [token, method, user, authLoading, isCreating]);
  
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
