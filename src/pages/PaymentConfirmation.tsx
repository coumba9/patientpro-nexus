
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const PaymentConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [appointmentData, setAppointmentData] = useState<any>(null);

  const token = searchParams.get("token");
  const method = searchParams.get("method");

  // Ajouter des logs pour déboguer
  useEffect(() => {
    console.log("PaymentConfirmation component loaded");
    console.log("Current URL:", window.location.href);
    console.log("Token:", token);
    console.log("Method:", method);
    console.log("Search params:", searchParams.toString());
  }, [token, method, searchParams]);

  useEffect(() => {
    const verifyPayment = async () => {
      console.log("Starting payment verification...");
      
      if (!token) {
        console.error("No token found in URL");
        setStatus("error");
        toast.error("Token de paiement manquant");
        return;
      }

      try {
        // Récupérer les données de rendez-vous en attente
        const pendingAppointment = localStorage.getItem("pendingAppointment");
        console.log("Pending appointment data:", pendingAppointment);
        
        if (pendingAppointment) {
          const data = JSON.parse(pendingAppointment);
          setAppointmentData(data);
          console.log("Appointment data set:", data);
        }

        // Simuler la vérification du paiement
        console.log("Simulating payment verification...");
        await new Promise(resolve => setTimeout(resolve, 2000));

        // En mode développement, considérer le paiement comme réussi
        // En production, faire un appel API pour vérifier le statut
        console.log("Payment verification completed successfully");
        setStatus("success");
        
        // Enregistrer le rendez-vous comme confirmé
        if (pendingAppointment) {
          const appointmentData = JSON.parse(pendingAppointment);
          const confirmedAppointments = JSON.parse(localStorage.getItem("confirmedAppointments") || "[]");
          confirmedAppointments.push({
            ...appointmentData,
            paymentToken: token,
            paymentMethod: method,
            status: "confirmed",
            confirmedAt: new Date().toISOString()
          });
          localStorage.setItem("confirmedAppointments", JSON.stringify(confirmedAppointments));
          console.log("Appointment confirmed and saved");
        }
        
        // Nettoyer le localStorage
        localStorage.removeItem("pendingAppointment");
        console.log("Pending appointment data cleaned");
        
        toast.success("Paiement confirmé avec succès !");
        
      } catch (error) {
        console.error("Erreur lors de la vérification du paiement:", error);
        setStatus("error");
        toast.error("Erreur lors de la vérification du paiement");
      }
    };

    verifyPayment();
  }, [token, method]);
  
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
            <div className="mt-4 text-xs text-gray-500">
              Token: {token || "Non disponible"}
            </div>
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
              Paiement échoué
            </h2>
            <p className="text-gray-600 mb-6">
              Une erreur s'est produite lors du traitement de votre paiement.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => navigate("/book-appointment")}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retenter le paiement
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
                <p className="text-sm text-blue-700">
                  <strong>Token de transaction:</strong> {token}
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
