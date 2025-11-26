import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  FileText, 
  MessageCircle, 
  CreditCard, 
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DashboardStats {
  upcomingAppointments: number;
  completedAppointments: number;
  missedAppointments: number;
  unreadMessages: number;
  unpaidInvoices: number;
  documents: number;
  vaccinations: number;
}

interface UpcomingAppointment {
  id: string;
  date: string;
  time: string;
  doctor: { first_name: string; last_name: string };
  specialty: { name: string };
  status: string;
}

export const EnhancedDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    completedAppointments: 0,
    missedAppointments: 0,
    unreadMessages: 0,
    unpaidInvoices: 0,
    documents: 0,
    vaccinations: 0
  });
  const [nextAppointments, setNextAppointments] = useState<UpcomingAppointment[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);

      // Statistiques des rendez-vous
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id, status, date, time')
        .eq('patient_id', user.id);

      const now = new Date();
      const upcoming = appointments?.filter(a => 
        new Date(a.date + 'T' + a.time) > now && 
        !['cancelled', 'completed', 'no_show'].includes(a.status)
      ).length || 0;
      
      const completed = appointments?.filter(a => a.status === 'completed').length || 0;
      const missed = appointments?.filter(a => a.status === 'no_show').length || 0;

      // Messages non lus
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      // Factures impayées
      const { count: unpaidCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', user.id)
        .eq('payment_status', 'pending');

      // Documents
      const { count: documentsCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', user.id);

      // Vaccinations
      const { count: vaccinationsCount } = await supabase
        .from('vaccinations')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', user.id);

      setStats({
        upcomingAppointments: upcoming,
        completedAppointments: completed,
        missedAppointments: missed,
        unreadMessages: unreadCount || 0,
        unpaidInvoices: unpaidCount || 0,
        documents: documentsCount || 0,
        vaccinations: vaccinationsCount || 0
      });

      // Prochains rendez-vous détaillés
      const { data: nextAppts } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          status,
          doctor:doctor_id (
            id,
            profile:id (first_name, last_name),
            specialty:specialty_id (name)
          )
        `)
        .eq('patient_id', user.id)
        .gte('date', format(new Date(), 'yyyy-MM-dd'))
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(3);

      setNextAppointments((nextAppts || []) as any);

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Vue d'ensemble</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/patient')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Prochains RDV
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Rendez-vous à venir
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/patient/messages')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Messages
              </CardTitle>
              <MessageCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unreadMessages}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Messages non lus
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/patient/documents')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Documents
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.documents}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Documents médicaux
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Paiements
              </CardTitle>
              <CreditCard className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unpaidInvoices}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Factures en attente
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Prochains rendez-vous */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Prochains rendez-vous</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/patient')}>
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {nextAppointments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucun rendez-vous à venir
            </p>
          ) : (
            <div className="space-y-4">
              {nextAppointments.map((appt: any) => (
                <div 
                  key={appt.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => navigate(`/patient/appointment/${appt.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-2 min-w-[60px]">
                      <span className="text-xs font-medium text-primary">
                        {format(new Date(appt.date), 'MMM', { locale: fr }).toUpperCase()}
                      </span>
                      <span className="text-2xl font-bold">
                        {format(new Date(appt.date), 'd')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">
                        Dr. {appt.doctor?.profile?.first_name} {appt.doctor?.profile?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appt.doctor?.specialty?.name}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {appt.time}
                      </p>
                    </div>
                  </div>
                  <div>
                    {appt.status === 'confirmed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3" />
                        Confirmé
                      </span>
                    )}
                    {appt.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <AlertCircle className="h-3 w-3" />
                        En attente
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques de santé */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Votre santé en chiffres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.completedAppointments}</p>
                <p className="text-sm text-muted-foreground">Consultations réalisées</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.vaccinations}</p>
                <p className="text-sm text-muted-foreground">Vaccinations enregistrées</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.missedAppointments}</p>
                <p className="text-sm text-muted-foreground">RDV manqués</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              onClick={() => navigate('/find-doctor')}
            >
              <Calendar className="h-6 w-6" />
              <span className="text-xs">Prendre RDV</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              onClick={() => navigate('/patient/medical-history')}
            >
              <FileText className="h-6 w-6" />
              <span className="text-xs">Mon dossier</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              onClick={() => navigate('/patient/messages')}
            >
              <MessageCircle className="h-6 w-6" />
              <span className="text-xs">Messages</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              onClick={() => navigate('/patient/prescriptions')}
            >
              <Activity className="h-6 w-6" />
              <span className="text-xs">Ordonnances</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
