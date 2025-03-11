
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, MapPin, MessageCircle, CalendarDays, Check, X, FileText } from "lucide-react";
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
import { Label } from "@/components/ui/label";

interface Appointment {
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  type: string;
  status: "confirmed" | "pending";
}

interface AppointmentCardProps {
  appointment: Appointment;
  onSendMessage: (doctorName: string, message: string) => void;
  onReschedule: (appointmentId: number, reason: string) => void;
  onConfirm: (appointmentId: number) => void;
}

export const AppointmentCard = ({
  appointment,
  onSendMessage,
  onReschedule,
  onConfirm,
}: AppointmentCardProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  return (
    <div className="border rounded-lg p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{appointment.doctor}</h3>
            <span className={`text-sm px-2 py-0.5 rounded-full ${
              appointment.status === 'confirmed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {appointment.status === 'confirmed' ? 'Confirmé' : 'En attente'}
            </span>
          </div>
          <p className="text-gray-600">{appointment.specialty}</p>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Clock className="w-4 h-4" />
            {appointment.date} à {appointment.time}
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <MapPin className="w-4 h-4" />
            {appointment.location}
          </div>
          <p className="text-sm text-primary">{appointment.type}</p>
        </div>
        <div className="space-y-2 md:space-y-0 md:space-x-2 flex flex-col md:flex-row">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
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
                  onClick={() => {
                    onSendMessage(appointment.doctor, newMessage);
                    setNewMessage("");
                  }}
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
                  onClick={() => {
                    onReschedule(appointment.id, rescheduleReason);
                    setRescheduleReason("");
                  }}
                  className="w-full"
                >
                  Confirmer le report
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {appointment.status === "pending" ? (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => onConfirm(appointment.id)}
            >
              <Check className="h-4 w-4 mr-2" />
              Confirmer
            </Button>
          ) : (
            <>
              <Link to="/patient/tickets">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Voir le ticket
                </Button>
              </Link>
            </>
          )}

          <Button variant="destructive" size="sm">
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
};
