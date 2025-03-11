import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, 
  Video, 
  MapPin, 
  Download,
  Clock,
  Euro,
  Wallet,
  Phone,
  Ticket
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

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto">
      <NavigationHeader isHomePage={false} onBack={() => navigate(-1)} />
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <Ticket className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Mes Tickets de Rendez-vous</h2>
          </div>
          {appointments.length === 0 ? (
            <div className="bg-blue-50 text-blue-700 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <Ticket className="h-12 w-12 text-blue-400" />
                <p className="text-lg">
                  Aucun ticket disponible. Les tickets sont créés une fois les rendez-vous confirmés.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
                  <div 
                    ref={(el) => (ticketRefs.current[appointment.id] = el)}
                    className="p-6 bg-white relative"
                  >
                    <div className="flex justify-between items-center mb-4 pb-4 border-b">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-gray-800">{appointment.doctor}</h3>
                          <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                            {appointment.id}
                          </Badge>
                        </div>
                        <p className="text-primary font-medium">{appointment.specialty}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === "confirmed" 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : "bg-blue-100 text-blue-800 border-blue-200"
                        }`}>
                          {appointment.status === "confirmed" ? "Confirmé" : "Terminé"}
                        </Badge>
                        <span className="text-sm text-gray-500 mt-1">
                          {appointment.type === "teleconsultation" ? "Téléconsultation" : "Consultation en personne"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-3 text-gray-700">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <CalendarDays className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium">{formatDate(appointment.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Heure</p>
                            <p className="font-medium">{appointment.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                          <div className="bg-blue-100 p-2 rounded-full">
                            {appointment.type === "teleconsultation" ? (
                              <Video className="h-5 w-5 text-primary" />
                            ) : (
                              <MapPin className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Lieu</p>
                            <p className="font-medium">{appointment.location}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-3 text-gray-700">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Euro className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Prix</p>
                            <p className="font-medium">{appointment.price}€</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                          <div className="bg-blue-100 p-2 rounded-full">
                            {getPaymentMethodIcon(appointment.paymentMethod)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Méthode de paiement</p>
                            <p className="font-medium">{getPaymentMethodName(appointment.paymentMethod)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Wallet className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Statut du paiement</p>
                            <Badge className={`mt-1 ${
                              appointment.paymentStatus === "paid" 
                                ? "bg-green-100 text-green-800 border-green-200" 
                                : "bg-yellow-100 text-yellow-800 border-yellow-200"
                            }`}>
                              {appointment.paymentStatus === "paid" ? "Payé" : "En attente"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="pt-4 bg-gray-50 border-t">
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadTicket(appointment)}
                        className="flex items-center gap-2 bg-white hover:bg-blue-50 text-primary hover:text-primary-foreground transition-all"
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
