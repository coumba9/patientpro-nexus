
import { useNavigate } from "react-router-dom";
import { NavigationHeader } from "@/components/patient/NavigationHeader";
import { AppointmentTicket as TicketComponent } from "@/components/patient/AppointmentTicket";
import { EmptyTicketsList } from "@/components/patient/EmptyTicketsList";
import { TicketsHeader } from "@/components/patient/TicketsHeader";
import { useRealtimeAppointments } from "@/hooks/useRealtimeAppointments";
import { useAuth } from "@/hooks/useAuth";

const AppointmentTickets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointments, loading } = useRealtimeAppointments(user?.id || null, 'patient');

  // Filtrer les rendez-vous confirmés ou complétés pour les tickets
  const ticketAppointments = appointments.filter(
    apt => apt.status === 'confirmed' || apt.status === 'completed'
  );

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto">
      <NavigationHeader isHomePage={false} onBack={() => navigate(-1)} />
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-sm p-6">
          <TicketsHeader title="Mes Tickets de Rendez-vous" />
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          ) : ticketAppointments.length === 0 ? (
            <EmptyTicketsList />
          ) : (
            <div className="space-y-6">
              {ticketAppointments.map((appointment) => (
                <TicketComponent 
                  key={appointment.id} 
                  appointment={appointment} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentTickets;
