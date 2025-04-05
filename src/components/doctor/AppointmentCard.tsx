
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import {
  Video,
  Clock,
  User,
  MapPin,
  ArrowRight,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface Appointment {
  id: number;
  patient: string;
  date: string;
  time: string;
  type: "Consultation" | "Suivi" | "Téléconsultation";
  status: "confirmed" | "pending" | "canceled";
  reason: string;
  isOnline: boolean;
}

interface AppointmentCardProps {
  appointment: Appointment;
  onConfirm: (id: number) => void;
  onCancel: (id: number) => void;
}

export const AppointmentCard = ({
  appointment,
  onConfirm,
  onCancel,
}: AppointmentCardProps) => {
  const navigate = useNavigate();
  
  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmé</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case "canceled":
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>;
      default:
        return null;
    }
  };

  const handleStartAppointment = () => {
    if (appointment.isOnline) {
      // Navigate to teleconsultation page with patient info
      navigate(`/doctor/teleconsultation`, { 
        state: { 
          patient: appointment.patient,
          reason: appointment.reason,
          time: appointment.time,
          date: appointment.date
        } 
      });
      toast.success(`Téléconsultation avec ${appointment.patient} démarrée`);
    } else {
      // Start in-person consultation
      navigate(`/doctor/patients/${encodeURIComponent(appointment.patient)}`, {
        state: {
          appointmentStarted: true,
          appointmentId: appointment.id,
          appointmentTime: appointment.time,
          appointmentReason: appointment.reason
        }
      });
      toast.success(`Consultation avec ${appointment.patient} démarrée`);
    }
  };

  return (
    <div className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">{appointment.patient}</h3>
          {getStatusBadge(appointment.status)}
          {appointment.isOnline && (
            <Badge variant="outline" className="bg-blue-50">
              <Video className="h-3 w-3 mr-1" />
              Téléconsultation
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600">{appointment.reason}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {appointment.time}
            </span>
            {!appointment.isOnline && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Cabinet
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        {appointment.status === "pending" ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 md:flex-initial"
              onClick={() => onConfirm(appointment.id)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmer
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 md:flex-initial text-red-600 hover:text-red-600"
              onClick={() => onCancel(appointment.id)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Refuser
            </Button>
          </>
        ) : (
          appointment.status === "confirmed" && (
            <>
              <Button 
                className="flex-1 md:flex-initial"
                onClick={handleStartAppointment}
              >
                {appointment.isOnline ? (
                  <>
                    <Video className="h-4 w-4 mr-2" />
                    Démarrer
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Commencer
                  </>
                )}
              </Button>
              <Link to={`/doctor/patients/${encodeURIComponent(appointment.patient)}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 md:flex-initial"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Dossier
                </Button>
              </Link>
            </>
          )
        )}
      </div>
    </div>
  );
};
