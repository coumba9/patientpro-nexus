
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Search, User, FileText, Calendar, Activity, Pill, MessageCircle, AlertCircle, Eye } from "lucide-react";
import { AddMedicalRecordForm } from "./AddMedicalRecordForm";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  lastVisit: string;
}

interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  doctor: string;
}

interface PatientNote {
  id: string;
  date: string;
  title: string;
  content: string;
}

interface PatientRecordProps {
  initialPatientName?: string;
}

export const PatientRecord = ({ initialPatientName }: PatientRecordProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTab, setSelectedTab] = useState("info");
  const [showAddRecordForm, setShowAddRecordForm] = useState(false);
  const [refreshHistory, setRefreshHistory] = useState(0);

  // Données de démonstration
  const patients: Patient[] = [
    { id: "1", name: "Seynabou Seye", age: 45, gender: "Femme", contact: "seyna@example.com", lastVisit: "15/03/2024" },
    { id: "2", name: "Ansou Faye", age: 62, gender: "Homme", contact: "ansou@example.com", lastVisit: "02/04/2024" },
    { id: "3", name: "Sophie Ndiaye", age: 38, gender: "Femme", contact: "sophie@example.com", lastVisit: "24/03/2024" },
    { id: "4", name: "Badara Sene", age: 28, gender: "Homme", contact: "bada@example.com", lastVisit: "10/04/2024" },
  ];

  const medicalRecords: Record<string, MedicalRecord[]> = {
    "1": [
      { id: "m1", date: "15/03/2024", diagnosis: "Hypertension artérielle", prescription: "Amlodipine 5mg", notes: "Contrôle tension dans 2 semaines", doctor: "Dr. Martin" },
      { id: "m2", date: "02/02/2024", diagnosis: "Rhinopharyngite", prescription: "Paracétamol 1000mg", notes: "Repos conseillé", doctor: "Dr. Bernard" }
    ],
    "2": [
      { id: "m3", date: "02/04/2024", diagnosis: "Diabète de type 2", prescription: "Metformine 500mg", notes: "Régime alimentaire à suivre", doctor: "Dr. Martin" }
    ],
    "3": [
      { id: "m4", date: "24/03/2024", diagnosis: "Migraine", prescription: "Sumatriptan 50mg", notes: "Éviter les facteurs déclenchants", doctor: "Dr. Dubois" }
    ],
    "4": [
      { id: "m5", date: "10/04/2024", diagnosis: "Entorse cheville", prescription: "Ibuprofène 400mg", notes: "Repos et glace", doctor: "Dr. Martin" }
    ]
  };

  const patientNotes: Record<string, PatientNote[]> = {
    "1": [
      { id: "n1", date: "16/03/2024", title: "Suivi tension", content: "Patient se plaint de vertiges occasionnels" },
      { id: "n2", date: "02/02/2024", title: "Questions patient", content: "S'inquiète des effets secondaires des médicaments" }
    ],
    "2": [
      { id: "n3", date: "03/04/2024", title: "Suivi glycémie", content: "Glycémie à jeun encore élevée malgré le traitement" }
    ],
    "3": [
      { id: "n4", date: "25/03/2024", title: "Facteurs déclenchants", content: "Patient identifie le stress comme principal facteur déclenchant" }
    ],
    "4": [
      { id: "n5", date: "11/04/2024", title: "Exercices rééducation", content: "Patient souhaite reprendre le sport rapidement" }
    ]
  };

  // Si un nom de patient est fourni, sélectionner ce patient au chargement
  useEffect(() => {
    if (initialPatientName) {
      const patient = patients.find(p => p.name.includes(initialPatientName));
      if (patient) {
        setSelectedPatient(patient);
        setSelectedTab("info");
      }
    }
  }, [initialPatientName]);

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setSelectedTab("info");
    setShowAddRecordForm(false);
  };

  const getPatientRecords = (patientId: string) => {
    return medicalRecords[patientId] || [];
  };

  const getPatientNotes = (patientId: string) => {
    return patientNotes[patientId] || [];
  };

  const handleRecordAdded = () => {
    setRefreshHistory(prev => prev + 1);
    // En pratique, ici on rechargerait les données depuis l'API
  };

  return (
    <div className="space-y-6">
      {!selectedPatient && (
        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
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
                  <p><span className="font-medium">Âge:</span> {patient.age} ans</p>
                  <p><span className="font-medium">Sexe:</span> {patient.gender}</p>
                  <p><span className="font-medium">Contact:</span> {patient.contact}</p>
                  <p><span className="font-medium">Dernière visite:</span> {patient.lastVisit}</p>
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
                      <div className="text-lg font-medium">{selectedPatient.age} ans</div>
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <div className="space-y-4">
                <AddMedicalRecordForm
                  patientId={selectedPatient.id}
                  doctorId="current-doctor-id" // TODO: Get from auth context
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
                    {getPatientRecords(selectedPatient.id).length > 0 ? (
                      <div className="space-y-4">
                        {getPatientRecords(selectedPatient.id).map(record => {
                          const prescriptionData = {
                            id: record.id,
                            date: record.date,
                            doctor: record.doctor,
                            medications: [
                              { 
                                name: record.prescription.split(' ')[0], 
                                dosage: record.prescription.split(' ')[1] || "Selon ordonnance",
                                frequency: "Selon prescription médicale"
                              }
                            ],
                            duration: "Selon prescription",
                            signed: true,
                            patientName: selectedPatient.name,
                            patientAge: `${selectedPatient.age} ans`,
                            diagnosis: record.diagnosis,
                            doctorSpecialty: "Médecin généraliste",
                            doctorAddress: "Cabinet médical"
                          };

                          return (
                            <Card key={record.id} className="bg-background border">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-md flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {record.date} - {record.doctor}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        // Ici on pourrait ouvrir la PrescriptionViewer
                                        console.log('Voir ordonnance', prescriptionData);
                                      }}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Voir ordonnance
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
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border-l-4 border-blue-500">
                                  <span className="font-medium flex items-center gap-1 text-blue-900 dark:text-blue-100">
                                    <Pill className="h-4 w-4" />
                                    Prescription:
                                  </span> 
                                  <p className="text-blue-800 dark:text-blue-200 mt-1 font-semibold">{record.prescription}</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border-l-4 border-green-500">
                                  <span className="font-medium flex items-center gap-1 text-green-900 dark:text-green-100">
                                    <MessageCircle className="h-4 w-4" />
                                    Notes:
                                  </span> 
                                  <p className="text-green-800 dark:text-green-200 mt-1">{record.notes}</p>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">Aucun historique médical disponible</p>
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
                  {getPatientNotes(selectedPatient.id).length > 0 ? (
                    <div className="space-y-4">
                      {getPatientNotes(selectedPatient.id).map(note => (
                        <Card key={note.id} className="bg-background border">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-md flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                                {note.title}
                              </div>
                              <span className="text-sm text-muted-foreground">{note.date}</span>
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
    </div>
  );
};
