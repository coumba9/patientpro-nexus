import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, 
  Video, 
  MapPin, 
  Download,
  Clock,
  User,
  Mail
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Card } from "@/components/ui/card";
import { Appointment } from "@/api/interfaces";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";

interface AppointmentTicketProps {
  appointment: Appointment;
}

export const AppointmentTicket = ({ appointment }: AppointmentTicketProps) => {
  const ticketRef = useRef<HTMLDivElement | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Extraire les données du médecin
  const doctorName = appointment.doctor?.profile 
    ? `Dr. ${appointment.doctor.profile.first_name} ${appointment.doctor.profile.last_name}`
    : 'Médecin non spécifié';
  
  const specialtyName = appointment.doctor?.specialty?.name || 
                        appointment.doctor?.specialties?.name || 
                        'Non spécifiée';

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-ticket-email', {
        body: { 
          appointmentId: appointment.id,
          patientEmail: appointment.patient?.profile?.email,
          doctorName,
          specialtyName,
          date: formatDate(appointment.date),
          time: appointment.time,
          mode: appointment.mode,
          location: appointment.location,
          type: getTypeLabel()
        }
      });

      if (error) throw error;
      
      toast.success("Ticket envoyé par email avec succès");
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      toast.error("Erreur lors de l'envoi de l'email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDownloadTicket = async () => {
    if (!ticketRef.current) {
      toast.error("Impossible de générer le ticket");
      return;
    }

    try {
      const canvas = await html2canvas(ticketRef.current, {
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
      pdf.save(`Ticket_${appointment.id.substring(0, 8)}_${doctorName.replace(/\s+/g, "_")}.pdf`);

      toast.success("Ticket téléchargé avec succès");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
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

  const getStatusBadge = () => {
    switch (appointment.status) {
      case 'confirmed':
        return <Badge className="bg-green-500 hover:bg-green-600">Confirmé</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Terminé</Badge>;
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      default:
        return <Badge variant="outline">{appointment.status}</Badge>;
    }
  };

  const getTypeLabel = () => {
    switch (appointment.type) {
      case 'consultation':
        return 'Consultation';
      case 'follow_up':
        return 'Suivi';
      case 'emergency':
        return 'Urgence';
      default:
        return appointment.type;
    }
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
      <div 
        ref={ticketRef}
        className="p-6 bg-card relative"
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-foreground">{doctorName}</h3>
            <p className="text-sm text-muted-foreground">{specialtyName}</p>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CalendarDays className="h-5 w-5 text-primary mt-1" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-medium">Date et heure</p>
              <p className="text-base font-semibold text-foreground">
                {formatDate(appointment.date)} à {appointment.time}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {appointment.mode === "teleconsultation" ? (
              <Video className="h-5 w-5 text-blue-600 mt-1" />
            ) : (
              <MapPin className="h-5 w-5 text-green-600 mt-1" />
            )}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-medium">Mode de consultation</p>
              <p className="text-base font-semibold text-foreground">
                {appointment.mode === "teleconsultation" ? "Téléconsultation" : "Consultation au cabinet"}
              </p>
              {appointment.location && (
                <p className="text-sm text-muted-foreground mt-1">{appointment.location}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-primary mt-1" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-medium">Type de consultation</p>
              <p className="text-base font-semibold text-foreground">{getTypeLabel()}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-1" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-medium">Numéro de rendez-vous</p>
              <p className="text-base font-semibold text-foreground font-mono">
                {appointment.id.substring(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {appointment.notes && (
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium">Notes</p>
                <p className="text-sm text-foreground mt-1">{appointment.notes}</p>
              </div>
            </div>
          )}

          {/* QR Code pour check-in rapide */}
          <div className="flex items-center justify-center pt-4 mt-4 border-t border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">QR Code - Check-in rapide</p>
              <div className="bg-white p-3 rounded-lg inline-block">
                <QRCodeSVG 
                  value={appointment.id} 
                  size={120}
                  level="H"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">ID: {appointment.id.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Ce ticket confirme votre rendez-vous. Veuillez le présenter lors de votre consultation.
          </p>
        </div>
      </div>

      <div className="p-4 bg-muted/30 border-t border-border">
        <div className="flex gap-2">
          <Button 
            onClick={handleDownloadTicket}
            className="flex-1"
            variant="default"
          >
            <Download className="mr-2 h-4 w-4" />
            Télécharger PDF
          </Button>
          <Button 
            onClick={handleSendEmail}
            className="flex-1"
            variant="outline"
            disabled={isSendingEmail}
          >
            <Mail className="mr-2 h-4 w-4" />
            {isSendingEmail ? "Envoi..." : "Envoyer par email"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
