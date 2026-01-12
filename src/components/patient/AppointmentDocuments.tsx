import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Pill, Activity, MessageCircle, FileSignature } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generatePrescriptionPDF, generateMedicalReportPDF } from "@/lib/pdfGenerator";

interface Document {
  id: string;
  title: string;
  type: string;
  file_url?: string;
  created_at: string;
  is_signed?: boolean;
  signed_at?: string | null;
  doctor_name?: string;
}

interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  prescription: string | null;
  notes: string | null;
  doctor_id: string;
  doctor_name?: string;
}

interface AppointmentDocumentsProps {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  patientName?: string;
}

export const AppointmentDocuments = ({ 
  appointmentId, 
  patientId, 
  doctorId,
  patientName = "Patient"
}: AppointmentDocumentsProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<MedicalRecord | null>(null);
  const [showPrescriptionViewer, setShowPrescriptionViewer] = useState(false);

  useEffect(() => {
    loadData();
  }, [appointmentId, patientId, doctorId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch documents
      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select('id, title, type, file_url, created_at, doctor_id, is_signed, signed_at')
        .eq('patient_id', patientId)
        .eq('doctor_id', doctorId);

      if (docsError) {
        console.error('Error fetching documents:', docsError);
      }

      // Fetch medical records
      const { data: recordsData, error: recordsError } = await supabase
        .from('medical_records')
        .select('id, date, diagnosis, prescription, notes, doctor_id')
        .eq('patient_id', patientId)
        .eq('doctor_id', doctorId)
        .order('date', { ascending: false });

      if (recordsError) {
        console.error('Error fetching medical records:', recordsError);
      }

      // Get unique doctor IDs for fetching names
      const allDoctorIds = [
        ...new Set([
          ...(docsData || []).map(d => d.doctor_id),
          ...(recordsData || []).map(r => r.doctor_id)
        ])
      ];

      // Fetch doctor profiles
      let doctorNames: Record<string, string> = {};
      if (allDoctorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', allDoctorIds);

        if (profiles) {
          profiles.forEach(p => {
            doctorNames[p.id] = `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Médecin';
          });
        }
      }

      // Enrich documents with doctor names
      const enrichedDocs = (docsData || []).map(doc => ({
        ...doc,
        doctor_name: doctorNames[doc.doctor_id] || 'Médecin'
      }));

      // Enrich records with doctor names
      const enrichedRecords = (recordsData || []).map(record => ({
        ...record,
        doctor_name: doctorNames[record.doctor_id] || 'Médecin'
      }));

      setDocuments(enrichedDocs);
      setMedicalRecords(enrichedRecords);
    } catch (error) {
      console.error('Error loading appointment documents:', error);
      toast.error('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPrescription = (record: MedicalRecord) => {
    setSelectedPrescription(record);
    setShowPrescriptionViewer(true);
  };

  const handleDownloadPrescription = (record: MedicalRecord) => {
    const medications = parsePrescriptionToMedications(record.prescription || '');
    
    generatePrescriptionPDF({
      date: format(new Date(record.date), 'dd/MM/yyyy'),
      patientName,
      doctorName: record.doctor_name || 'Médecin',
      doctorSpecialty: 'Médecin',
      diagnosis: record.diagnosis,
      medications,
      notes: record.notes || undefined,
      signed: true
    });
    toast.success("Ordonnance téléchargée");
  };

  const handleDownloadReport = (record: MedicalRecord) => {
    generateMedicalReportPDF({
      date: format(new Date(record.date), 'dd/MM/yyyy'),
      patientName,
      doctorName: record.doctor_name || 'Médecin',
      diagnosis: record.diagnosis,
      prescription: record.prescription || undefined,
      notes: record.notes || undefined
    });
    toast.success("Compte-rendu téléchargé");
  };

  const handleDownloadDocument = async (doc: Document) => {
    if (!doc.file_url) {
      toast.error('Aucun fichier disponible');
      return;
    }
    toast.success(`Téléchargement de ${doc.title}...`);
    window.open(doc.file_url, '_blank');
  };

  const parsePrescriptionToMedications = (prescription: string) => {
    if (!prescription) return [];
    
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(prescription);
      if (Array.isArray(parsed.medications)) {
        return parsed.medications;
      }
    } catch {
      // Not JSON, parse as text
    }

    // Parse text prescription
    const lines = prescription.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      return [{ name: prescription, dosage: "Selon ordonnance", frequency: "Selon prescription" }];
    }
    
    return lines.map(line => ({
      name: line.split('-')[0]?.trim() || line.trim(),
      dosage: line.split('-')[1]?.trim() || "Selon ordonnance",
      frequency: line.split('-')[2]?.trim() || "Selon prescription"
    }));
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
      {/* Medical records */}
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
                      Dr. {record.doctor_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(record.date), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>

                {record.notes && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border-l-4 border-green-500">
                    <span className="font-medium flex items-center gap-1 text-green-900 dark:text-green-100">
                      <MessageCircle className="h-4 w-4" />
                      Notes :
                    </span>
                    <p className="text-green-800 dark:text-green-200 mt-1">{record.notes}</p>
                  </div>
                )}

                {record.prescription && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border-l-4 border-blue-500">
                    <span className="font-medium flex items-center gap-1 text-blue-900 dark:text-blue-100">
                      <Pill className="h-4 w-4" />
                      Prescription :
                    </span>
                    <p className="text-blue-800 dark:text-blue-200 mt-1 whitespace-pre-line">
                      {record.prescription}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  {record.prescription && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPrescription(record)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir ordonnance
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPrescription(record)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger ordonnance
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReport(record)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger compte-rendu
                  </Button>
                </div>
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
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{doc.title}</p>
                      {doc.is_signed ? (
                        <Badge variant="outline" className="gap-1">
                          <FileSignature className="h-3 w-3" />
                          Signé
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Non signé</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: fr })}
                      {doc.is_signed && doc.signed_at ? (
                        <span>
                          {" "}• signé le {format(new Date(doc.signed_at), 'dd/MM/yyyy', { locale: fr })}
                        </span>
                      ) : null}
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
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Aucun document disponible pour ce rendez-vous</p>
            <p className="text-sm mt-2">
              Les documents seront ajoutés par votre médecin après la consultation
            </p>
          </CardContent>
        </Card>
      )}

      {/* Prescription viewer dialog */}
      {selectedPrescription && showPrescriptionViewer && (
        <Dialog open={showPrescriptionViewer} onOpenChange={setShowPrescriptionViewer}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Ordonnance du {format(new Date(selectedPrescription.date), 'dd MMMM yyyy', { locale: fr })}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPrescription(selectedPrescription)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger PDF
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-lg border">
              <div className="border-b pb-4">
                <p className="font-semibold text-lg">Dr. {selectedPrescription.doctor_name}</p>
                <p className="text-sm text-muted-foreground">Médecin</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Patient</h3>
                <p>{patientName}</p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-red-800 dark:text-red-200">
                  <Activity className="h-4 w-4" />
                  Diagnostic
                </h3>
                <p className="text-red-700 dark:text-red-300">{selectedPrescription.diagnosis}</p>
              </div>

              {selectedPrescription.prescription && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-800 dark:text-blue-200">
                    <Pill className="h-4 w-4" />
                    Médicaments prescrits
                  </h3>
                  <div className="space-y-3">
                    {parsePrescriptionToMedications(selectedPrescription.prescription).map((med, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-800 p-3 rounded border">
                        <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-muted-foreground">Dosage: {med.dosage}</p>
                        <p className="text-sm text-muted-foreground">Posologie: {med.frequency}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPrescription.notes && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Recommandations</h3>
                  <p className="text-yellow-700 dark:text-yellow-300">{selectedPrescription.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
