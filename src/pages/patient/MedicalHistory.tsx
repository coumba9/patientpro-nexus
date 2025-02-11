
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MedicalHistory = () => {
  const medicalHistory = [
    {
      date: "2024-01-15",
      type: "Consultation",
      doctor: "Dr. Martin",
      description: "Consultation de routine - Tension artérielle normale",
    },
    {
      date: "2023-12-10",
      type: "Analyse",
      doctor: "Laboratoire Central",
      description: "Bilan sanguin complet - Résultats normaux",
    },
    {
      date: "2023-11-05",
      type: "Vaccination",
      doctor: "Dr. Bernard",
      description: "Vaccination grippe saisonnière",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6">Mon Dossier Médical</h2>
        <div className="space-y-4">
          {medicalHistory.map((entry, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {entry.type} - {entry.date}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{entry.doctor}</p>
                <p className="text-gray-600">{entry.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicalHistory;
