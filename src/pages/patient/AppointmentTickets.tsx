
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CalendarDays, 
  MessageSquare, 
  Video, 
  MapPin, 
  Download,
  Clock,
  Euro
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface AppointmentTicket {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  type: "consultation" | "teleconsultation";
  status: "confirmed" | "pending" | "completed" | "cancelled";
  location: string;
  price: number;
  paymentStatus: "paid" | "pending";
}

const AppointmentTickets = () => {
  const [appointments] = useState<AppointmentTicket[]>([
    {
      id: "RDV-001",
      doctor: "Dr. Sarah Martin",
      specialty: "Cardiologue",
      date: "2024-02-25",
      time: "14:30",
      type: "consultation",
      status: "confirmed",
      location: "Cabinet Médical, Paris",
      price: 50,
      paymentStatus: "paid",
    },
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
    },
  ]);

  const [rescheduleReason, setRescheduleReason] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const handleDownloadTicket = (appointmentId: string) => {
    toast.success("Ticket téléchargé avec succès");
  };

  const handleSendMessage = (doctorName: string) => {
    if (newMessage.trim()) {
      toast.success(`Message envoyé au ${doctorName}`);
      setNewMessage("");
    }
  };

  const handleReschedule = (appointmentId: string) => {
    if (rescheduleReason.trim()) {
      toast.success("Demande de report envoyée");
      setRescheduleReason("");
    }
  };

  const getStatusBadgeColor = (status: AppointmentTicket["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6">Mes Tickets de Rendez-vous</h2>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="relative">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{appointment.doctor}</span>
                  <span className={`text-sm px-3 py-1 rounded-full ${getStatusBadgeColor(appointment.status)}`}>
                    {appointment.status === "confirmed" ? "Confirmé" : 
                     appointment.status === "pending" ? "En attente" :
                     appointment.status === "completed" ? "Terminé" : "Annulé"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-gray-600">{appointment.specialty}</p>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarDays className="h-4 w-4" />
                      {appointment.date}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      {appointment.time}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      {appointment.type === "teleconsultation" ? (
                        <Video className="h-4 w-4 text-blue-500" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                      {appointment.location}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Euro className="h-4 w-4" />
                      {appointment.price}€ - {appointment.paymentStatus === "paid" ? "Payé" : "En attente de paiement"}
                    </div>
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <div className="space-x-2 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadTicket(appointment.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Envoyer un message</DialogTitle>
                            <DialogDescription>
                              Envoyer un message à {appointment.doctor}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <Textarea
                              placeholder="Votre message..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <Button 
                              onClick={() => handleSendMessage(appointment.doctor)}
                              className="w-full"
                            >
                              Envoyer
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Reporter
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reporter le rendez-vous</DialogTitle>
                            <DialogDescription>
                              Veuillez indiquer la raison du report
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                              <Label>Motif du report</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionnez un motif" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="schedule_conflict">Conflit d'horaire</SelectItem>
                                  <SelectItem value="transportation">Problème de transport</SelectItem>
                                  <SelectItem value="health">Raison de santé</SelectItem>
                                  <SelectItem value="other">Autre</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Précisions (optionnel)</Label>
                              <Textarea
                                placeholder="Détails supplémentaires..."
                                value={rescheduleReason}
                                onChange={(e) => setRescheduleReason(e.target.value)}
                              />
                            </div>
                            <Button 
                              onClick={() => handleReschedule(appointment.id)}
                              className="w-full"
                            >
                              Confirmer le report
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppointmentTickets;
