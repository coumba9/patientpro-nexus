
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  CalendarDays, 
  Video, 
  MapPin, 
  Download,
  Clock,
  Euro,
  Wallet,
  Phone
} from "lucide-react";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { NavigationHeader } from "@/components/patient/NavigationHeader";
import { useNavigate } from "react-router-dom";

interface AppointmentTicket {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  type: "consultation" | "teleconsultation";
  status: "confirmed" | "completed";
  location: string;
  price: number;
  paymentStatus: "paid" | "pending";
  paymentMethod: "card" | "cash" | "wave" | "orange-money" | "mobile-money" | "thirdparty";
}

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

  const ticketRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const navigate = useNavigate();

  const handleDownloadTicket = async (appointment: AppointmentTicket) => {
    const ticketElement = ticketRefs.current[appointment.id];
    
    if (!ticketElement) {
      toast.error("Impossible de générer le ticket");
      return;
    }

    try {
      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Ticket_${appointment.id}_${appointment.doctor.replace(/\s+/g, "_")}.pdf`);

      toast.success("Ticket téléchargé avec succès");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  const getStatusBadgeColor = (status: AppointmentTicket["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodIcon = (method: AppointmentTicket["paymentMethod"]) => {
    switch (method) {
      case "card":
        return <Euro className="h-4 w-4" />;
      case "cash":
        return <Euro className="h-4 w-4" />;
      case "wave":
        return <Wallet className="h-4 w-4 text-blue-600" />;
      case "orange-money":
        return <Phone className="h-4 w-4 text-orange-500" />;
      case "mobile-money":
        return <Phone className="h-4 w-4 text-green-500" />;
      case "thirdparty":
        return <Euro className="h-4 w-4" />;
      default:
        return <Euro className="h-4 w-4" />;
    }
  };

  const getPaymentMethodName = (method: AppointmentTicket["paymentMethod"]) => {
    switch (method) {
      case "card":
        return "Carte bancaire";
      case "cash":
        return "Espèces";
      case "wave":
        return "Wave";
      case "orange-money":
        return "Orange Money";
      case "mobile-money":
        return "Mobile Money";
      case "thirdparty":
        return "Tiers payant";
      default:
        return "Autre";
    }
  };

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto">
      <NavigationHeader isHomePage={false} onBack={() => navigate(-1)} />
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6">Mes Tickets de Rendez-vous</h2>
          {appointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun ticket disponible. Les tickets sont créés une fois les rendez-vous confirmés.
            </p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="relative">
                  <div 
                    ref={(el) => (ticketRefs.current[appointment.id] = el)}
                    className="p-4 bg-white rounded-lg border-dashed border-2 border-gray-200 relative"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex flex-col">
                        <h3 className="text-xl font-bold">{appointment.doctor}</h3>
                        <p className="text-gray-600">{appointment.specialty}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold">{appointment.id}</span>
                        <span className={`text-sm px-3 py-1 rounded-full ${getStatusBadgeColor(appointment.status)}`}>
                          {appointment.status === "confirmed" ? "Confirmé" : "Terminé"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t border-dashed border-gray-200 pt-4 mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <CalendarDays className="h-4 w-4" />
                            <span>Date: {appointment.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>Heure: {appointment.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            {appointment.type === "teleconsultation" ? (
                              <Video className="h-4 w-4 text-blue-500" />
                            ) : (
                              <MapPin className="h-4 w-4" />
                            )}
                            <span>Lieu: {appointment.location}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Euro className="h-4 w-4" />
                            <span>Prix: {appointment.price}€</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            {getPaymentMethodIcon(appointment.paymentMethod)}
                            <span>Paiement: {getPaymentMethodName(appointment.paymentMethod)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className={`px-2 py-1 rounded text-xs ${appointment.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                              {appointment.paymentStatus === "paid" ? "Payé" : "En attente"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="pt-4">
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadTicket(appointment)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Télécharger en PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentTickets;
