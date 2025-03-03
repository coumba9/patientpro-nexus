
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSignature } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const Prescriptions = () => {
  const prescriptions = [
    {
      date: "2024-02-15",
      doctor: "Dr. Martin",
      medications: [
        { name: "Paracétamol", dosage: "1000mg", frequency: "3x par jour" },
        { name: "Ibuprofène", dosage: "400mg", frequency: "2x par jour" },
      ],
      duration: "7 jours",
      signed: true,
    },
    {
      date: "2024-01-20",
      doctor: "Dr. Bernard",
      medications: [
        { name: "Amoxicilline", dosage: "500mg", frequency: "2x par jour" },
      ],
      duration: "5 jours",
      signed: true,
    },
    {
      date: "2024-03-05",
      doctor: "Dr. Martin",
      medications: [
        { name: "Doliprane", dosage: "500mg", frequency: "3x par jour" },
      ],
      duration: "3 jours",
      signed: false,
    },
  ];

  const handleDownload = () => {
    toast.success("Ordonnance téléchargée");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6">Mes Ordonnances</h2>
        <div className="space-y-4">
          {prescriptions.map((prescription, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>Ordonnance du {prescription.date}</span>
                    {prescription.signed ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <FileSignature className="h-3 w-3 mr-1" />
                        Signée
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        En attente de signature
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold mb-2">{prescription.doctor}</p>
                <ul className="space-y-2">
                  {prescription.medications.map((med, idx) => (
                    <li key={idx} className="text-gray-600">
                      {med.name} - {med.dosage} - {med.frequency}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-gray-500">
                  Durée du traitement : {prescription.duration}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;
