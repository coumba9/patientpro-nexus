
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientRecord } from "@/components/doctor/PatientRecord";
import { ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";

const PatientDetails = () => {
  const { patientName } = useParams<{ patientName: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler un chargement de données
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <Link to="/doctor">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Accueil
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dossier de {patientName}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-6">
              <div className="animate-pulse">Chargement des données...</div>
            </div>
          ) : (
            <PatientRecord initialPatientName={patientName} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDetails;
