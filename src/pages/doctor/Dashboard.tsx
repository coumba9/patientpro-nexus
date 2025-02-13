
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  MessageCircle,
  FileText,
  Settings,
  Video,
  Clock,
  User,
  MapPin,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
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

const appointments: Appointment[] = [
  {
    id: 1,
    patient: "Marie Dubois",
    date: "2024-02-20",
    time: "14:30",
    type: "Consultation",
    status: "confirmed",
    reason: "Suivi traitement",
    isOnline: false,
  },
  {
    id: 2,
    patient: "Jean Martin",
    date: "2024-02-20",
    time: "15:00",
    type: "Téléconsultation",
    status: "pending",
    reason: "Renouvellement ordonnance",
    isOnline: true,
  },
  {
    id: 3,
    patient: "Sophie Lambert",
    date: "2024-02-20",
    time: "16:00",
    type: "Suivi",
    status: "confirmed",
    reason: "Contrôle post-opératoire",
    isOnline: false,
  },
];

const DoctorDashboard = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>(appointments);

  const handleConfirm = (appointmentId: number) => {
    setUpcomingAppointments(prev =>
      prev.map(app =>
        app.id === appointmentId
          ? { ...app, status: "confirmed" as const }
          : app
      )
    );
    toast.success("Rendez-vous confirmé");
  };

  const handleCancel = (appointmentId: number) => {
    setUpcomingAppointments(prev =>
      prev.map(app =>
        app.id === appointmentId
          ? { ...app, status: "canceled" as const }
          : app
      )
    );
    toast.success("Rendez-vous annulé");
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <Link to="/doctor">
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <Calendar className="mr-2 h-5 w-5" />
                Agenda
              </Button>
            </Link>
            <Link to="/doctor/patients">
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <Users className="mr-2 h-5 w-5" />
                Patients
              </Button>
            </Link>
            <Link to="/doctor/teleconsultation">
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <Video className="mr-2 h-5 w-5" />
                Téléconsultation
              </Button>
            </Link>
            <Link to="/doctor/messages">
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Messages
              </Button>
            </Link>
            <Link to="/doctor/documents">
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <FileText className="mr-2 h-5 w-5" />
                Documents
              </Button>
            </Link>
            <Link to="/doctor/settings">
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <Settings className="mr-2 h-5 w-5" />
                Paramètres
              </Button>
            </Link>
          </div>

          {/* Main Content */}
          <div className="md:col-span-4">
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
                      <p className="text-2xl font-bold">8</p>
                      <p className="text-xs text-gray-500">3 en téléconsultation</p>
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
                      <p className="text-2xl font-bold">5</p>
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
                      <p className="text-2xl font-bold">3</p>
                      <p className="text-xs text-gray-500">À traiter</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Rendez-vous du jour</CardTitle>
                <Link to="/doctor/teleconsultation">
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    Espace téléconsultation
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
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
                                onClick={() => handleConfirm(appointment.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirmer
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 md:flex-initial text-red-600 hover:text-red-600"
                                onClick={() => handleCancel(appointment.id)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Refuser
                              </Button>
                            </>
                          ) : (
                            appointment.status === "confirmed" && (
                              <>
                                {appointment.isOnline ? (
                                  <Button className="flex-1 md:flex-initial">
                                    <Video className="h-4 w-4 mr-2" />
                                    Démarrer
                                  </Button>
                                ) : (
                                  <Button className="flex-1 md:flex-initial">
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    Commencer
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 md:flex-initial"
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Dossier
                                </Button>
                              </>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
