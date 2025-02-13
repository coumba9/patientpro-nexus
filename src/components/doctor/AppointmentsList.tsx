
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppointmentCard } from "./AppointmentCard";

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

interface AppointmentsListProps {
  appointments: Appointment[];
  onConfirm: (id: number) => void;
  onCancel: (id: number) => void;
}

export const AppointmentsList = ({
  appointments,
  onConfirm,
  onCancel,
}: AppointmentsListProps) => {
  return (
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
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onConfirm={onConfirm}
                onCancel={onCancel}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
