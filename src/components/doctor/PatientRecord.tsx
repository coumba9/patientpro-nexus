import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Search, User, FileText, Calendar, Activity, Pill, MessageCircle, AlertCircle, Eye, Download, Plus } from "lucide-react";
import { AddMedicalRecordForm } from "./AddMedicalRecordForm";
import { PrescriptionViewer } from "./PrescriptionViewer";
import { useAuth } from "@/hooks/useAuth";
import { useRealPatients } from "@/hooks/useRealPatients";
import { useMedicalRecords } from "@/hooks/useMedicalRecords";
import { generatePrescriptionPDF, generateMedicalReportPDF } from "@/lib/pdfGenerator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  lastVisit: string;
  blood_type?: string;
  allergies?: string[];
  email?: string;
  phone_number?: string;
}

interface PatientRecordProps {
  initialPatientName?: string;
}

export const PatientRecord = ({ initialPatientName }: PatientRecordProps) => {
  const { user } = useAuth();
  const { patients: realPatients, loading } = useRealPatients(user?.id || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTab, setSelectedTab] = useState("info");
  const [showAddRecordForm, setShowAddRecordForm] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [showPrescriptionViewer, setShowPrescriptionViewer] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Fetch medical records for selected patient
  const { records: medicalRecords, notes: patientNotes, loading: recordsLoading, refetch } = useMedicalRecords(
    selectedPatient?.id || null,
    user?.id || null
  );

  // Use real patients from database - memoized to avoid infinite loops
  const patients: Patient[] = realPatients.map(p => ({
    id: p.id,
    name: p.name,
    age: p.age,
    gender: p.gender,
    contact: p.contact,
    lastVisit: p.lastVisit,
    blood_type: p.blood_type,
    allergies: p.allergies,
    email: p.email,
    phone_number: p.phone_number
  }));

  // Si un nom de patient est fourni, sélectionner ce patient au chargement (seulement une fois)
  useEffect(() => {
    if (initialPatientName && realPatients.length > 0 && !hasInitialized) {
      const patient = realPatients.find(p => p.name.toLowerCase().includes(initialPatientName.toLowerCase()));
      if (patient) {
        setSelectedPatient({
          id: patient.id,
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          contact: patient.contact,
          lastVisit: patient.lastVisit,
          blood_type: patient.blood_type,
          allergies: patient.allergies,
          email: patient.email,
          phone_number: patient.phone_number
        });
        setSelectedTab("info");
        setHasInitialized(true);
      }
    }
  }, [initialPatientName, realPatients, hasInitialized]);

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setSelectedTab("info");
    setShowAddRecordForm(false);
  };

  const handleRecordAdded = () => {
    refetch();
    toast.success("Dossier médical ajouté avec succès");
  };

  const handleViewPrescription = (record: any) => {
    const prescriptionData = {
      id: record.id,
      date: new Date(record.date).toLocaleDateString('fr-FR'),
      doctor: record.doctor ? `${record.doctor.first_name || ''} ${record.doctor.last_name || ''}`.trim() : 'Médecin',
      medications: record.prescription ? parsePrescription(record.prescription) : [],
      duration: "Selon prescription",
      signed: true,
      patientName: selectedPatient?.name || 'Patient',
      patientAge: selectedPatient?.age ? `${selectedPatient.age} ans` : 'N/A',
      diagnosis: record.diagnosis,
      doctorSpecialty: "Médecin",
      doctorAddress: "Cabinet médical"
    };
    setSelectedPrescription(prescriptionData);
    setShowPrescriptionViewer(true);
  };

  const parsePrescription = (prescription: string) => {
    // Parse prescription text into medication objects
    const lines = prescription.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      return [{ name: prescription, dosage: "Selon ordonnance", frequency: "Selon prescription" }];
    }
    return lines.map(line => ({
      name: line.split('-')[0]?.trim() || line,
      dosage: line.split('-')[1]?.trim() || "Selon ordonnance",
      frequency: line.split('-')[2]?.trim() || "Selon prescription"
    }));
  };

  const handleDownloadPrescription = (record: any) => {
    const doctorName = record.doctor 
      ? `${record.doctor.first_name || ''} ${record.doctor.last_name || ''}`.trim() 
      : 'Médecin';
    
    generatePrescriptionPDF({
      date: new Date(record.date).toLocaleDateString('fr-FR'),
      patientName: selectedPatient?.name || 'Patient',
      patientAge: selectedPatient?.age ? `${selectedPatient.age} ans` : undefined,
      doctorName,
      doctorSpecialty: "Médecin",
      diagnosis: record.diagnosis,
      medications: parsePrescription(record.prescription || ''),
      notes: record.notes,
      signed: true
    });
    toast.success("Ordonnance téléchargée");
  };

  const handleDownloadReport = (record: any) => {
    const doctorName = record.doctor 
      ? `${record.doctor.first_name || ''} ${record.doctor.last_name || ''}`.trim() 
      : 'Médecin';
    
    generateMedicalReportPDF({
      date: new Date(record.date).toLocaleDateString('fr-FR'),
      patientName: selectedPatient?.name || 'Patient',
      patientAge: selectedPatient?.age ? `${selectedPatient.age} ans` : undefined,
      doctorName,
      doctorSpecialty: "Médecin",
      diagnosis: record.diagnosis,
      prescription: record.prescription,
      notes: record.notes
    });
    toast.success("Compte-rendu téléchargé");
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des patients...</div>;
  }

  if (!loading && patients.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Aucun patient</h3>
        <p className="text-muted-foreground">
          Vous n'avez pas encore de patients avec des consultations terminées.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!selectedPatient && (
        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un patient..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {!selectedPatient ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map(patient => (
            <Card 
              key={patient.id} 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleSelectPatient(patient)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {patient.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Âge:</span> {patient.age > 0 ? `${patient.age} ans` : 'Non renseigné'}</p>
                  <p><span className="font-medium">Sexe:</span> {patient.gender}</p>
                  <p><span className="font-medium">Contact:</span> {patient.contact}</p>
                  <p><span className="font-medium">Dernière visite:</span> {patient.lastVisit}</p>
                  {patient.blood_type && (
                    <p><span className="font-medium">Groupe sanguin:</span> {patient.blood_type}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Dossier de {selectedPatient.name}</h2>
            {!initialPatientName && (
              <Button variant="outline" onClick={() => setSelectedPatient(null)}>
                Retour à la liste
              </Button>
            )}
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="history">Historique médical</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Informations personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nom complet</Label>
                      <div className="text-lg font-medium">{selectedPatient.name}</div>
                    </div>
                    <div>
                      <Label>Âge</Label>
                      <div className="text-lg font-medium">
                        {selectedPatient.age > 0 ? `${selectedPatient.age} ans` : 'Non renseigné'}
                      </div>
                    </div>
                    <div>
                      <Label>Sexe</Label>
                      <div className="text-lg font-medium">{selectedPatient.gender}</div>
                    </div>
                    <div>
                      <Label>Contact</Label>
                      <div className="text-lg font-medium">{selectedPatient.contact}</div>
                    </div>
                    <div>
                      <Label>Dernière visite</Label>
                      <div className="text-lg font-medium">{selectedPatient.lastVisit}</div>
                    </div>
                    {selectedPatient.blood_type && (
                      <div>
                        <Label>Groupe sanguin</Label>
                        <div className="text-lg font-medium">{selectedPatient.blood_type}</div>
                      </div>
                    )}
                    {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                      <div className="md:col-span-2">
                        <Label>Allergies</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedPatient.allergies.map((allergy, idx) => (
                            <Badge key={idx} variant="destructive">{allergy}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <div className="space-y-4">
                <AddMedicalRecordForm
                  patientId={selectedPatient.id}
                  doctorId={user?.id || ''}
                  onRecordAdded={handleRecordAdded}
                  isVisible={showAddRecordForm}
                  onToggleVisibility={() => setShowAddRecordForm(!showAddRecordForm)}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Historique médical
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recordsLoading ? (
                      <div className="text-center py-4">Chargement des dossiers...</div>
                    ) : medicalRecords.length > 0 ? (
                      <div className="space-y-4">
                        {medicalRecords.map(record => {
                          const doctorName = record.doctor 
                            ? `Dr. ${record.doctor.first_name || ''} ${record.doctor.last_name || ''}`.trim()
                            : 'Médecin';

                          return (
                            <Card key={record.id} className="bg-background border">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-md flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {new Date(record.date).toLocaleDateString('fr-FR')} - {doctorName}
                                  </div>
                                  <div className="flex gap-2">
                                    {record.prescription && (
                                      <>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => handleViewPrescription(record)}
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          Voir
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => handleDownloadPrescription(record)}
                                        >
                                          <Download className="h-4 w-4 mr-1" />
                                          Ordonnance
                                        </Button>
                                      </>
                                    )}
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleDownloadReport(record)}
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Rapport
                                    </Button>
                                  </div>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border-l-4 border-red-500">
                                  <span className="font-medium flex items-center gap-1 text-red-900 dark:text-red-100">
                                    <Activity className="h-4 w-4" />
                                    Diagnostic:
                                  </span> 
                                  <p className="text-red-800 dark:text-red-200 mt-1">{record.diagnosis}</p>
                                </div>
                                {record.prescription && (
                                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border-l-4 border-blue-500">
                                    <span className="font-medium flex items-center gap-1 text-blue-900 dark:text-blue-100">
                                      <Pill className="h-4 w-4" />
                                      Prescription:
                                    </span> 
                                    <p className="text-blue-800 dark:text-blue-200 mt-1 whitespace-pre-line">{record.prescription}</p>
                                  </div>
                                )}
                                {record.notes && (
                                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border-l-4 border-green-500">
                                    <span className="font-medium flex items-center gap-1 text-green-900 dark:text-green-100">
                                      <MessageCircle className="h-4 w-4" />
                                      Notes:
                                    </span> 
                                    <p className="text-green-800 dark:text-green-200 mt-1">{record.notes}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">Aucun historique médical disponible</p>
                        <Button onClick={() => setShowAddRecordForm(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter un premier diagnostic
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Notes du patient
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patientNotes.length > 0 ? (
                    <div className="space-y-4">
                      {patientNotes.map(note => (
                        <Card key={note.id} className="bg-background border">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-md flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                                {note.title}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(note.date).toLocaleDateString('fr-FR')}
                              </span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>{note.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Aucune note disponible</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {selectedPrescription && (
        <PrescriptionViewer
          prescription={selectedPrescription}
          isOpen={showPrescriptionViewer}
          onClose={() => {
            setShowPrescriptionViewer(false);
            setSelectedPrescription(null);
          }}
          onDownload={() => {
            if (selectedPatient && selectedPrescription) {
              generatePrescriptionPDF({
                date: selectedPrescription.date,
                patientName: selectedPrescription.patientName,
                patientAge: selectedPrescription.patientAge,
                doctorName: selectedPrescription.doctor,
                doctorSpecialty: selectedPrescription.doctorSpecialty,
                diagnosis: selectedPrescription.diagnosis,
                medications: selectedPrescription.medications,
                signed: selectedPrescription.signed
              });
              toast.success("Ordonnance téléchargée");
            }
          }}
        />
      )}
    </div>
  );
};
