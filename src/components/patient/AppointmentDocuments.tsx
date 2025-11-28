import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PrescriptionViewer } from "@/components/doctor/PrescriptionViewer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Document {
  id: string;
  title: string;
  type: string;
  file_url?: string;
  created_at: string;
  doctor: {
    profiles: {
      first_name: string;
      last_name: string;
    };
  };
}

interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  prescription: string | null;
  notes: string | null;
  doctor: {
    profiles: {
      first_name: string;
      last_name: string;
    };
  };
}

interface AppointmentDocumentsProps {
  appointmentId: string;
  patientId: string;
  doctorId: string;
}

export const AppointmentDocuments = ({ 
  appointmentId, 
  patientId, 
  doctorId 
}: AppointmentDocumentsProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<string | null>(null);
  const [showPrescriptionViewer, setShowPrescriptionViewer] = useState(false);

  useEffect(() => {
    loadData();
  }, [appointmentId, patientId, doctorId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger les documents liés au rendez-vous
      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select(`
          *,
          doctors!documents_doctor_id_fkey (
            id,
            profiles!doctors_id_fkey (first_name, last_name)
          )
        `)
        .eq('patient_id', patientId)
        .eq('doctor_id', doctorId);

      if (docsError) throw docsError;
      setDocuments((docsData as any) || []);

      // Charger les comptes-rendus médicaux
      const { data: recordsData, error: recordsError } = await supabase
        .from('medical_records')
        .select(`
          *,
          doctors!medical_records_doctor_id_fkey (
            id,
            profiles!doctors_id_fkey (first_name, last_name)
          )
        `)
        .eq('patient_id', patientId)
        .eq('doctor_id', doctorId)
        .order('date', { ascending: false });

      if (recordsError) throw recordsError;
      setMedicalRecords((recordsData as any) || []);
    } catch (error) {
      console.error('Error loading appointment documents:', error);
      toast.error('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPrescription = (prescription: string) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionViewer(true);
  };

  const handleDownloadDocument = async (doc: Document) => {
    if (!doc.file_url) {
      toast.error('Aucun fichier disponible');
      return;
    }
    toast.success(`Téléchargement de ${doc.title}...`);
    window.open(doc.file_url, '_blank');
  };

  const parsePrescription = (prescriptionStr: string) => {
    try {
      return JSON.parse(prescriptionStr);
    } catch {
      return { medications: [], recommendations: prescriptionStr };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comptes-rendus médicaux */}
      {medicalRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Comptes-rendus médicaux
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {medicalRecords.map((record) => (
              <div
                key={record.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-lg">{record.diagnosis}</p>
                    <p className="text-sm text-muted-foreground">
                      Dr. {record.doctor?.profiles?.first_name} {record.doctor?.profiles?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(record.date), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>

                {record.notes && (
                  <div className="text-sm">
                    <p className="font-medium mb-1">Notes :</p>
                    <p className="text-muted-foreground">{record.notes}</p>
                  </div>
                )}

                {record.prescription && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPrescription(record.prescription!)}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir l'ordonnance
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents médicaux
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
                {doc.file_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadDocument(doc)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {documents.length === 0 && medicalRecords.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun document disponible pour ce rendez-vous
          </CardContent>
        </Card>
      )}

      {/* Viewer d'ordonnance */}
      {selectedPrescription && showPrescriptionViewer && (
        <Dialog open={showPrescriptionViewer} onOpenChange={setShowPrescriptionViewer}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ordonnance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {(() => {
                const prescription = parsePrescription(selectedPrescription);
                return (
                  <>
                    {prescription.medications && prescription.medications.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold">Médicaments prescrits :</h3>
                        {prescription.medications.map((med: any, idx: number) => (
                          <div key={idx} className="border p-3 rounded-lg">
                            <p className="font-medium">{med.name}</p>
                            <p className="text-sm text-muted-foreground">Dosage: {med.dosage}</p>
                            <p className="text-sm text-muted-foreground">Fréquence: {med.frequency}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {prescription.recommendations && (
                      <div>
                        <h3 className="font-semibold mb-2">Recommandations :</h3>
                        <p className="text-sm text-muted-foreground">{prescription.recommendations}</p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
