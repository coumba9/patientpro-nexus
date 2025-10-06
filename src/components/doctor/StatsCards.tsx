
import {
  Calendar,
  AlertCircle,
  MessageCircle,
  ChartBar,
  Percent,
  FileText
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRealtimeAppointments } from "@/hooks/useRealtimeAppointments";

interface StatsCardsProps {
  doctorId: string;
}

export const StatsCards = ({ doctorId }: StatsCardsProps) => {
  const { appointments, loading } = useRealtimeAppointments(doctorId, 'doctor');

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

  if (loading) {
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
              <p className="text-xs text-gray-500">{teleconsultationsToday.length} en téléconsultation</p>
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
              <p className="text-xs text-gray-500">À confirmer</p>
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
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-gray-500">À traiter</p>
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
              <p className="text-xs text-gray-500">Mois en cours</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Total rendez-vous
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Percent className="h-8 w-8 text-purple-500 mr-2" />
            <div>
              <p className="text-2xl font-bold">{appointments.length}</p>
              <p className="text-xs text-gray-500">Tous les rendez-vous</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Rendez-vous confirmés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-green-500 mr-2" />
            <div>
              <p className="text-2xl font-bold">
                {appointments.filter(apt => apt.status === 'confirmed').length}
              </p>
              <p className="text-xs text-gray-500">Confirmés</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
