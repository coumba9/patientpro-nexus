import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Download, CreditCard, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface AppointmentPayment {
  id: string;
  date: string;
  status: string;
  payment_status: string | null;
  payment_amount: number | null;
  payment_id: string | null;
  type: string;
  mode: string;
  doctor_id: string;
  doctorProfile?: {
    first_name: string;
    last_name: string;
  };
}

export const PaymentHistory = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentPayment[]>([]);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');

  useEffect(() => {
    if (!user?.id) return;
    loadPaymentHistory();
  }, [user]);

  const loadPaymentHistory = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Get all appointments for the patient
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, date, status, payment_status, payment_amount, payment_id, type, mode, doctor_id')
        .eq('patient_id', user.id)
        .in('status', ['completed', 'confirmed', 'pending'])
        .order('date', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      // Get unique doctor IDs
      const doctorIds = [...new Set(
        (appointmentsData || []).map((apt) => apt.doctor_id).filter(Boolean)
      )];

      // Fetch doctor profiles
      let doctorProfiles: Record<string, any> = {};
      if (doctorIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', doctorIds);
        
        if (profilesData) {
          doctorProfiles = profilesData.reduce((acc: any, p: any) => {
            acc[p.id] = p;
            return acc;
          }, {});
        }
      }

      // Merge doctor profiles
      const appointmentsWithProfiles = (appointmentsData || []).map((apt) => ({
        ...apt,
        doctorProfile: doctorProfiles[apt.doctor_id] || null
      }));

      setAppointments(appointmentsWithProfiles);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (appointmentId: string) => {
    toast.success(`Préparation du téléchargement...`);
  };

  const getStatusBadge = (paymentStatus: string | null, appointmentStatus: string) => {
    if (appointmentStatus === 'completed') {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Consultation effectuée
        </Badge>
      );
    }
    
    if (paymentStatus === 'paid') {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Payé
        </Badge>
      );
    }
    
    if (appointmentStatus === 'confirmed') {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Clock className="h-3 w-3 mr-1" />
          Confirmé - À venir
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
        <Clock className="h-3 w-3 mr-1" />
        En attente
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'consultation': 'Consultation',
      'followup': 'Suivi',
      'emergency': 'Urgence',
      'checkup': 'Bilan'
    };
    return types[type] || type;
  };

  const getModeLabel = (mode: string) => {
    return mode === 'teleconsultation' ? 'Téléconsultation' : 'En cabinet';
  };

  const getConsultationPrice = (apt: AppointmentPayment) => {
    return apt.payment_amount || 15000;
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    if (filter === 'paid') return apt.status === 'completed' || apt.payment_status === 'paid';
    if (filter === 'pending') return apt.status !== 'completed' && apt.payment_status !== 'paid';
    return true;
  });

  const totalCompleted = appointments
    .filter(apt => apt.status === 'completed')
    .reduce((sum, apt) => sum + getConsultationPrice(apt), 0);

  const totalPending = appointments
    .filter(apt => apt.status !== 'completed' && apt.status !== 'cancelled')
    .reduce((sum, apt) => sum + getConsultationPrice(apt), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consultations effectuées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalCompleted.toLocaleString()} FCFA
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {appointments.filter(a => a.status === 'completed').length} consultation(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rendez-vous à venir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalPending.toLocaleString()} FCFA
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length} rendez-vous
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total rendez-vous
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Historique des consultations</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Tous
              </Button>
              <Button
                variant={filter === 'paid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('paid')}
              >
                Effectués
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                À venir
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune consultation trouvée
            </p>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        Dr. {apt.doctorProfile?.first_name || 'Médecin'}{' '}
                        {apt.doctorProfile?.last_name || ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getTypeLabel(apt.type)} - {getModeLabel(apt.mode)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(apt.date), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <p className="font-bold">{getConsultationPrice(apt).toLocaleString()} FCFA</p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {getStatusBadge(apt.payment_status, apt.status)}
                      {apt.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadInvoice(apt.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Facture
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
