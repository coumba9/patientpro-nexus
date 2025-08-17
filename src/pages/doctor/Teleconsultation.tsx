
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  VideoIcon, 
  Users, 
  Calendar, 
  Settings, 
  FileSignature, 
  Link as LinkIcon,
  ArrowLeft,
  Home 
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Teleconsultation = () => {
  const [meetLink, setMeetLink] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [currentConsultation, setCurrentConsultation] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const upcomingConsultations = [
    {
      id: 1,
      patient: "Marie Dubois",
      date: "Aujourd'hui",
      time: "14:30",
      reason: "Renouvellement ordonnance",
      meetLink: "https://meet.google.com/abc-def-ghi"
    },
    {
      id: 2,
      patient: "Jean Martin",
      date: "Demain",
      time: "10:15",
      reason: "Consultation de suivi",
      meetLink: "https://zoom.us/j/123456789"
    },
    {
      id: 3,
      patient: "Sophie Lambert",
      date: "22/06/2025",
      time: "16:00",
      reason: "Première consultation",
      meetLink: ""
    }
  ];

  useEffect(() => {
    // Check if there's state from navigation
    if (location.state && location.state.patient) {
      // Find the consultation in the list or create one if it doesn't exist
      const existingConsultation = upcomingConsultations.find(
        c => c.patient === location.state.patient
      );
      
      if (existingConsultation) {
        startConsultation(existingConsultation);
      } else {
        // Create a new consultation object based on the navigation state
        const newConsultation = {
          id: Date.now(),
          patient: location.state.patient,
          date: location.state.date || "Aujourd'hui",
          time: location.state.time || new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
          reason: location.state.reason || "Consultation",
          meetLink: ""
        };
        
        startConsultation(newConsultation);
      }
    }
  }, [location.state]);

  const startConsultation = (consultation: any) => {
    setCurrentConsultation(consultation);
    setActiveTab("session");
    toast.success(`Consultation avec ${consultation.patient} démarrée`);
  };

  const endConsultation = () => {
    setCurrentConsultation(null);
    setActiveTab("upcoming");
    toast.success("Consultation terminée");
  };

  const createMeetLink = () => {
    // Simuler la création d'un lien Meet
    const newLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 8)}-${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 5)}`;
    setMeetLink(newLink);
    toast.success("Lien de visioconférence créé");
    return newLink;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Lien copié dans le presse-papier");
  };

  const goToPatientFile = () => {
    if (currentConsultation && currentConsultation.patient) {
      navigate(`/doctor/patients/${encodeURIComponent(currentConsultation.patient)}`);
    }
  };

  const goToDocuments = () => {
    navigate('/doctor/documents');
  };

  return (
    <div className="grid gap-6">
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
      
      <Card>
        <CardHeader>
          <CardTitle>Téléconsultation</CardTitle>
          <CardDescription>Gérez vos consultations à distance</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full md:w-auto">
              <TabsTrigger value="upcoming">À venir</TabsTrigger>
              <TabsTrigger value="session">Session active</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>

            {/* Onglet des consultations à venir */}
            <TabsContent value="upcoming" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <VideoIcon className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">3</p>
                        <p className="text-sm text-gray-500">Consultations prévues aujourd'hui</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">12</p>
                        <p className="text-sm text-gray-500">Consultations cette semaine</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Users className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold">85%</p>
                        <p className="text-sm text-gray-500">Taux de satisfaction</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {upcomingConsultations.map((consultation) => (
                    <Card key={consultation.id} className="hover:bg-gray-50">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold">{consultation.patient}</h3>
                            </div>
                            <p className="text-sm text-gray-600">{consultation.reason}</p>
                            <div className="flex gap-4 text-sm text-gray-500">
                              <span>{consultation.date} - {consultation.time}</span>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            {!consultation.meetLink && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  const newLink = createMeetLink();
                                  consultation.meetLink = newLink;
                                }}
                              >
                                <LinkIcon className="h-4 w-4 mr-2" />
                                Créer un lien
                              </Button>
                            )}
                            {consultation.meetLink && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => copyToClipboard(consultation.meetLink)}
                              >
                                <LinkIcon className="h-4 w-4 mr-2" />
                                Copier le lien
                              </Button>
                            )}
                            <Button 
                              size="sm"
                              onClick={() => startConsultation(consultation)}
                            >
                              <VideoIcon className="h-4 w-4 mr-2" />
                              Démarrer
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Onglet de la session active de téléconsultation */}
            <TabsContent value="session" className="space-y-6">
              {currentConsultation ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        Consultation avec {currentConsultation.patient}
                      </h3>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={endConsultation}
                      >
                        Terminer la session
                      </Button>
                    </div>
                    <div className="aspect-video bg-gray-100 rounded-lg relative border-2 border-dashed border-gray-300">
                      {currentConsultation.meetLink ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 p-6">
                          <VideoIcon className="h-16 w-16 text-gray-400 mb-4" />
                          <p className="text-lg font-semibold mb-2 text-center">Session de téléconsultation</p>
                          <p className="text-sm text-center mb-4">
                            Pour des raisons de sécurité, les plateformes de visioconférence ne peuvent pas être intégrées directement.
                          </p>
                          <div className="flex flex-col gap-3 w-full max-w-md">
                            <Button 
                              onClick={() => window.open(currentConsultation.meetLink, '_blank')}
                              className="w-full"
                            >
                              <LinkIcon className="h-4 w-4 mr-2" />
                              Ouvrir la visioconférence
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => copyToClipboard(currentConsultation.meetLink)}
                              className="w-full"
                            >
                              Copier le lien
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                          <VideoIcon className="h-16 w-16 text-gray-400 mb-4" />
                          <p className="text-lg font-semibold mb-4">Aucun lien de visioconférence</p>
                          <Button 
                            onClick={() => {
                              const newLink = createMeetLink();
                              currentConsultation.meetLink = newLink;
                              setCurrentConsultation({...currentConsultation});
                            }}
                          >
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Créer un lien
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Informations du patient</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="font-semibold">Motif de consultation</p>
                            <p className="text-gray-600">{currentConsultation.reason}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Historique récent</p>
                            <p className="text-gray-600">Dernière consultation le 15/05/2025</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Actions rapides</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <Button 
                            variant="outline" 
                            className="justify-start"
                            onClick={goToDocuments}
                          >
                            <FileSignature className="h-4 w-4 mr-2" />
                            Signer ordonnance
                          </Button>
                          <Button 
                            variant="outline" 
                            className="justify-start"
                            onClick={goToPatientFile}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Dossier patient
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <VideoIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune consultation en cours</h3>
                  <p className="text-gray-500 mb-6">Démarrez une consultation depuis la liste des rendez-vous.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('upcoming')}
                  >
                    Voir les consultations à venir
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Onglet des paramètres */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Paramètres de visioconférence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="default-service">Service par défaut</Label>
                      <div className="flex gap-2 mt-1">
                        <Button variant="outline">Google Meet</Button>
                        <Button variant="ghost">Zoom</Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="meet-link">Lien personnalisé</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          id="meet-link" 
                          placeholder="https://meet.google.com/your-link" 
                          value={meetLink}
                          onChange={(e) => setMeetLink(e.target.value)}
                        />
                        <Button variant="outline" onClick={() => createMeetLink()}>
                          Générer
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Ce lien sera utilisé pour vos prochaines consultations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Teleconsultation;
