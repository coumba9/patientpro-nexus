
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationHeader } from "@/components/patient/NavigationHeader";
import { AppointmentTicket as TicketComponent, AppointmentTicket } from "@/components/patient/AppointmentTicket";
import { EmptyTicketsList } from "@/components/patient/EmptyTicketsList";
import { TicketsHeader } from "@/components/patient/TicketsHeader";

const AppointmentTickets = () => {
  const [appointments] = useState<AppointmentTicket[]>([
    {
      id: "RDV-002",
      doctor: "Dr. Thomas Bernard",
      specialty: "Dermatologue",
      date: "2024-03-01",
      time: "10:00",
      type: "teleconsultation",
      status: "confirmed",
      location: "Consultation en ligne",
      price: 35,
      paymentStatus: "paid",
      paymentMethod: "wave"
    },
    {
      id: "RDV-003",
      doctor: "Dr. Marie Dupont",
      specialty: "Généraliste",
      date: "2024-03-15",
      time: "14:30",
      type: "consultation",
      status: "confirmed",
      location: "Cabinet médical",
      price: 50,
      paymentStatus: "pending",
      paymentMethod: "orange-money"
    }
  ]);

  const navigate = useNavigate();

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto">
      <NavigationHeader isHomePage={false} onBack={() => navigate(-1)} />
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <TicketsHeader title="Mes Tickets de Rendez-vous" />
          
          {appointments.length === 0 ? (
            <EmptyTicketsList />
          ) : (
            <div className="space-y-6">
              {appointments.map((appointment) => (
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
