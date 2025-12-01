import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, FileText, Download, Eye, Activity, Pill, MessageCircle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { generatePrescriptionPDF, generateMedicalReportPDF } from "@/lib/pdfGenerator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  prescription: string | null;
  notes: string | null;
  doctor_id: string;
  doctor_name?: string;
  doctor_specialty?: string;
}

const MedicalHistory = () => {
  const { user } = useAuth();
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState("Patient");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch patient profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile) {
          setPatientName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Patient');
        }

        // Fetch medical records
        const { data: records, error: recordsError } = await supabase
          .from('medical_records')
          .select('id, date, diagnosis, prescription, notes, doctor_id')
          .eq('patient_id', user.id)
          .order('date', { ascending: false });

        if (recordsError) throw recordsError;

        if (!records || records.length === 0) {
          setMedicalHistory([]);
          return;
        }

        // Get unique doctor IDs
        const doctorIds = [...new Set(records.map(r => r.doctor_id))];
        
        // Fetch doctor profiles
        const { data: doctorProfiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', doctorIds);

        // Fetch doctor specialties
        const { data: doctors } = await supabase
          .from('doctors')
          .select('id, specialty_id')
          .in('id', doctorIds);

        const specialtyIds = [...new Set((doctors || []).map(d => d.specialty_id).filter(Boolean))];
        const { data: specialties } = await supabase
          .from('specialties')
          .select('id, name')
          .in('id', specialtyIds);

        // Create lookup maps
        const profileMap = new Map((doctorProfiles || []).map(p => [p.id, p]));
        const doctorMap = new Map((doctors || []).map(d => [d.id, d]));
        const specialtyMap = new Map((specialties || []).map(s => [s.id, s.name]));

        // Enrich records
        const enrichedRecords = records.map(record => {
          const profile = profileMap.get(record.doctor_id);
          const doctor = doctorMap.get(record.doctor_id);
          const specialtyName = doctor?.specialty_id ? specialtyMap.get(doctor.specialty_id) : null;
          
          return {
            ...record,
            doctor_name: profile 
              ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
              : 'Médecin',
            doctor_specialty: specialtyName || 'Médecin généraliste'
          };
        });

        setMedicalHistory(enrichedRecords);
      } catch (error) {
        console.error("Erreur lors du chargement du dossier médical:", error);
        toast.error("Erreur lors du chargement du dossier médical");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const parsePrescriptionToMedications = (prescription: string) => {
    if (!prescription) return [];
    
    try {
      const parsed = JSON.parse(prescription);
      if (Array.isArray(parsed.medications)) {
        return parsed.medications;
      }
    } catch {
      // Not JSON
    }

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

  const handleDownloadPrescription = (record: MedicalRecord) => {
    generatePrescriptionPDF({
      date: format(new Date(record.date), 'dd/MM/yyyy'),
      patientName,
      doctorName: record.doctor_name || 'Médecin',
      doctorSpecialty: record.doctor_specialty,
      diagnosis: record.diagnosis,
      medications: parsePrescriptionToMedications(record.prescription || ''),
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
      doctorSpecialty: record.doctor_specialty,
      diagnosis: record.diagnosis,
      prescription: record.prescription || undefined,
      notes: record.notes || undefined
    });
    toast.success("Compte-rendu téléchargé");
  };

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setShowViewer(true);
  };

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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Mon Dossier Médical</h2>
          <Badge variant="secondary">
            {medicalHistory.length} consultation(s)
          </Badge>
        </div>
        
        {medicalHistory.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun dossier médical</h3>
            <p className="text-muted-foreground">
              Votre dossier médical sera mis à jour après vos consultations
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {medicalHistory.map((record) => (
              <Card key={record.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5 text-red-500" />
                        {record.diagnosis}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(record.date), 'dd MMMM yyyy', { locale: fr })}
                      </div>
                    </div>
                    <Badge>{record.doctor_specialty}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Médecin:</span>
                    <span>Dr. {record.doctor_name}</span>
                  </div>

                  {record.prescription && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        <Pill className="h-4 w-4" />
                        Prescription
                      </div>
                      <p className="text-blue-700 dark:text-blue-300 whitespace-pre-line">
                        {record.prescription}
                      </p>
                    </div>
                  )}

                  {record.notes && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 font-semibold text-green-800 dark:text-green-200 mb-2">
                        <MessageCircle className="h-4 w-4" />
                        Notes et recommandations
                      </div>
                      <p className="text-green-700 dark:text-green-300">
                        {record.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewRecord(record)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir détails
                    </Button>
                    {record.prescription && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPrescription(record)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Ordonnance PDF
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReport(record)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Compte-rendu PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Detail viewer dialog */}
      {selectedRecord && showViewer && (
        <Dialog open={showViewer} onOpenChange={setShowViewer}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Détails de la consultation
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedRecord.date), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Médecin</p>
                  <p className="font-medium">Dr. {selectedRecord.doctor_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedRecord.doctor_specialty}</p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <h3 className="font-semibold flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
                  <Activity className="h-4 w-4" />
                  Diagnostic
                </h3>
                <p className="text-red-700 dark:text-red-300">{selectedRecord.diagnosis}</p>
              </div>

              {selectedRecord.prescription && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-3">
                    <Pill className="h-4 w-4" />
                    Prescription
                  </h3>
                  <div className="space-y-2">
                    {parsePrescriptionToMedications(selectedRecord.prescription).map((med, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-800 p-3 rounded border">
                        <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-muted-foreground">Dosage: {med.dosage}</p>
                        <p className="text-sm text-muted-foreground">Posologie: {med.frequency}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecord.notes && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2 text-green-800 dark:text-green-200 mb-2">
                    <MessageCircle className="h-4 w-4" />
                    Notes et recommandations
                  </h3>
                  <p className="text-green-700 dark:text-green-300">{selectedRecord.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                {selectedRecord.prescription && (
                  <Button onClick={() => handleDownloadPrescription(selectedRecord)}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger ordonnance
                  </Button>
                )}
                <Button variant="outline" onClick={() => handleDownloadReport(selectedRecord)}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger compte-rendu
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MedicalHistory;
