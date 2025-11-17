import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { medicalRecordService } from "@/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const MedicalHistory = () => {
  const { user } = useAuth();
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const records = await medicalRecordService.getRecordsByPatient(user.id);
        setMedicalHistory(records);
      } catch (error) {
        console.error("Erreur lors du chargement du dossier médical:", error);
        toast.error("Erreur lors du chargement du dossier médical");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6">Mon Dossier Médical</h2>
        {medicalHistory.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Aucun dossier médical pour le moment
          </p>
        ) : (
          <div className="space-y-4">
            {medicalHistory.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {record.diagnosis} - {new Date(record.date).toLocaleDateString('fr-FR')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-foreground">
                    Dr. {record.doctor?.profile?.first_name} {record.doctor?.profile?.last_name}
                  </p>
                  {record.prescription && (
                    <p className="text-muted-foreground mt-2">
                      <span className="font-semibold">Prescription:</span> {record.prescription}
                    </p>
                  )}
                  {record.notes && (
                    <p className="text-muted-foreground mt-2">
                      <span className="font-semibold">Notes:</span> {record.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;
