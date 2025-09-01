
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { PrescriptionCard } from "@/components/patient/PrescriptionCard";

const Prescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      date: "2024-02-15",
      doctor: "Dr. Martin",
      medications: [
        { name: "Paracétamol", dosage: "1000mg", frequency: "3x par jour" },
        { name: "Ibuprofène", dosage: "400mg", frequency: "2x par jour" },
      ],
      duration: "7 jours",
      signed: true,
      patientName: "Marie Dubois",
      patientAge: "45 ans",
      diagnosis: "Syndrome grippal",
      doctorSpecialty: "Médecin généraliste",
      doctorAddress: "123 Avenue de la Santé, Dakar"
    },
    {
      id: 2,
      date: "2024-01-20",
      doctor: "Dr. Bernard",
      medications: [
        { name: "Amoxicilline", dosage: "500mg", frequency: "2x par jour" },
      ],
      duration: "5 jours",
      signed: true,
      patientName: "Marie Dubois", 
      patientAge: "45 ans",
      diagnosis: "Infection bactérienne",
      doctorSpecialty: "Infectiologue",
      doctorAddress: "456 Rue des Spécialistes, Dakar"
    },
    {
      id: 3,
      date: "2024-03-05",
      doctor: "Dr. Martin",
      medications: [
        { name: "Doliprane", dosage: "500mg", frequency: "3x par jour" },
      ],
      duration: "3 jours",
      signed: false,
      patientName: "Marie Dubois",
      patientAge: "45 ans", 
      diagnosis: "Maux de tête",
      doctorSpecialty: "Médecin généraliste",
      doctorAddress: "123 Avenue de la Santé, Dakar"
    },
  ]);

  const handleDownload = (prescriptionId: number) => {
    // Simuler le téléchargement d'un PDF
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (prescription) {
      // Créer un blob simulé pour le téléchargement
      const content = `Ordonnance du ${prescription.date} - ${prescription.doctor}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ordonnance-${prescription.date}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Ordonnance téléchargée avec succès");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
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
          <Link to="/">
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
        
        <h2 className="text-2xl font-bold mb-6">Mes Ordonnances</h2>
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <PrescriptionCard
              key={prescription.id}
              prescription={prescription}
              onDownload={handleDownload}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;
