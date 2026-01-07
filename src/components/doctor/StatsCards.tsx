
import { useEffect, useState } from "react";
import {
  Calendar,
  AlertCircle,
  MessageCircle,
  ChartBar,
  FileText,
  Star
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRealtimeAppointments } from "@/hooks/useRealtimeAppointments";
import { supabase } from "@/integrations/supabase/client";

interface StatsCardsProps {
  doctorId: string;
}

export const StatsCards = ({ doctorId }: StatsCardsProps) => {
  const { appointments, loading } = useRealtimeAppointments(doctorId, 'doctor');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  
  const todayAppointments = appointments.filter(apt => apt.date === today);
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const teleconsultationsToday = todayAppointments.filter(apt => apt.mode === 'teleconsultation');
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
  });

  // Fetch real statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get unread messages count
        const { count: messagesCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', doctorId)
          .eq('is_read', false);

        // Get total documents count
        const { count: documentsCount } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .eq('doctor_id', doctorId);

        // Get average rating from ratings table
        const { data: ratingsData } = await supabase
          .from('ratings')
          .select('rating')
          .eq('doctor_id', doctorId);

        if (ratingsData && ratingsData.length > 0) {
          const sum = ratingsData.reduce((acc, r) => acc + r.rating, 0);
          const avg = Math.round((sum / ratingsData.length) * 10) / 10;
          setAverageRating(avg);
          setTotalRatings(ratingsData.length);
        }

        setUnreadMessages(messagesCount || 0);
        setTotalDocuments(documentsCount || 0);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (doctorId) {
      fetchStats();
    }
  }, [doctorId]);

  if (loading || statsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Consultations aujourd'hui
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-primary mr-2" />
            <div>
              <p className="text-2xl font-bold">{todayAppointments.length}</p>
              <p className="text-xs text-muted-foreground">{teleconsultationsToday.length} en téléconsultation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            En attente de confirmation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-500 mr-2" />
            <div>
              <p className="text-2xl font-bold">{pendingAppointments.length}</p>
              <p className="text-xs text-muted-foreground">À confirmer</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Note moyenne
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-500 mr-2 fill-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{averageRating > 0 ? averageRating : '-'}/5</p>
              <p className="text-xs text-muted-foreground">{totalRatings} évaluation{totalRatings !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Consultations ce mois
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <ChartBar className="h-8 w-8 text-green-600 mr-2" />
            <div>
              <p className="text-2xl font-bold">{monthlyAppointments.length}</p>
              <p className="text-xs text-muted-foreground">Mois en cours</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Messages non lus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <MessageCircle className="h-8 w-8 text-blue-500 mr-2" />
            <div>
              <p className="text-2xl font-bold">{unreadMessages}</p>
              <p className="text-xs text-muted-foreground">À traiter</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Documents médicaux
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-green-500 mr-2" />
            <div>
              <p className="text-2xl font-bold">{totalDocuments}</p>
              <p className="text-xs text-muted-foreground">Total créés</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
