
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PatientRecord } from "@/components/doctor/PatientRecord";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Patients = () => {
  const navigate = useNavigate();

  return (
    <div>
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

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6">Mes patients</h2>
        <PatientRecord />
      </div>
    </div>
  );
};

export default Patients;
