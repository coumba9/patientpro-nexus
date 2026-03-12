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
  FileSignature, 
  ArrowLeft,
  Home 
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { VideoCallRoom } from "@/components/teleconsultation/VideoCallRoom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const Teleconsultation = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activePatientName, setActivePatientName] = useState<string>("");
  const [teleconsultations, setTeleconsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Fetch teleconsultation appointments
  useEffect(() => {
    const fetchTeleconsultations = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('doctor_id', user.id)
          .eq('mode', 'teleconsultation')
          .in('status', ['confirmed', 'pending'])
          .order('date', { ascending: true });

        if (error) throw error;

        // Fetch patient names
        const enriched = await Promise.all(
          (data || []).map(async (apt) => {
            const { data: profile } = await supabase
              .rpc('get_safe_profile', { target_user_id: apt.patient_id });
            const p = profile?.[0];
            return {
              ...apt,
              patientName: p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : 'Patient',
            };
          })
        );

        setTeleconsultations(enriched);
      } catch (error) {
        console.error('Error fetching teleconsultations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeleconsultations();
  }, [user?.id]);

  // Handle navigation state (from appointment card)
  useEffect(() => {
    if (location.state?.appointmentId) {
      setActiveRoomId(location.state.appointmentId);
      setActivePatientName(location.state.patient || 'Patient');
      setActiveTab("session");
    }
  }, [location.state]);

  const startConsultation = (appointmentId: string, patientName: string) => {
    setActiveRoomId(appointmentId);
    setActivePatientName(patientName);
    setActiveTab("session");
    toast.success(`Consultation avec ${patientName} démarrée`);
  };

  const endConsultation = () => {
    setActiveRoomId(null);
    setActivePatientName("");
    setActiveTab("upcoming");
    toast.success("Consultation terminée");
  };

  const goToPatientFile = () => {
    if (activePatientName) {
      navigate(`/doctor/patients/${encodeURIComponent(activePatientName)}`);
    }
  };

  const goToDocuments = () => {
    navigate('/doctor/documents');
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = teleconsultations.filter(t => t.date === todayStr).length;

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
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Accueil
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Téléconsultation</CardTitle>
          <CardDescription>Consultations vidéo sécurisées avec vos patients</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full md:w-auto">
              <TabsTrigger value="upcoming">À venir</TabsTrigger>
              <TabsTrigger value="session">
                Session active
                {activeRoomId && (
                  <span className="ml-2 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <VideoIcon className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{todayCount}</p>
                        <p className="text-sm text-muted-foreground">Consultations aujourd'hui</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{teleconsultations.length}</p>
                        <p className="text-sm text-muted-foreground">Total à venir</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Users className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{activeRoomId ? "1" : "0"}</p>
                        <p className="text-sm text-muted-foreground">Session active</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Chargement...</div>
                  ) : teleconsultations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <VideoIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>Aucune téléconsultation programmée</p>
                    </div>
                  ) : (
                    teleconsultations.map((consultation) => (
                      <Card key={consultation.id} className="hover:bg-accent/50 transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold">{consultation.patientName}</h3>
                                {consultation.date === todayStr && (
                                  <Badge variant="default" className="bg-green-500 hover:bg-green-500">
                                    Aujourd'hui
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{consultation.type}</p>
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                <span>
                                  {new Date(consultation.date).toLocaleDateString('fr-FR')} - {consultation.time}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button 
                                size="sm"
                                onClick={() => startConsultation(consultation.id, consultation.patientName)}
                              >
                                <VideoIcon className="h-4 w-4 mr-2" />
                                Démarrer
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="session" className="space-y-6">
              {activeRoomId ? (
                <div className="space-y-4">
                  <VideoCallRoom
                    roomId={activeRoomId}
                    userName={`Dr. ${user?.user_metadata?.first_name || 'Médecin'}`}
                    isDoctor={true}
                    remoteName={activePatientName}
                    onEndCall={endConsultation}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start" onClick={goToDocuments}>
                      <FileSignature className="h-4 w-4 mr-2" />
                      Signer ordonnance
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={goToPatientFile}>
                      <Users className="h-4 w-4 mr-2" />
                      Dossier patient
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <VideoIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune consultation en cours</h3>
                  <p className="text-muted-foreground mb-6">Démarrez une consultation depuis la liste des rendez-vous.</p>
                  <Button variant="outline" onClick={() => setActiveTab('upcoming')}>
                    Voir les consultations à venir
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Teleconsultation;
