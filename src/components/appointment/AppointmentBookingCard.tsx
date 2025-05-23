
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppointmentHandler } from "./AppointmentHandler";
import { LoginPrompt } from "./LoginPrompt";
import { DoctorInfo } from "./doctorTypes";

interface AppointmentBookingCardProps {
  doctorName: string | null;
  specialty: string | null;
  isLoggedIn: boolean;
  doctorInfo: DoctorInfo;
}

export const AppointmentBookingCard = ({
  doctorName,
  specialty,
  isLoggedIn,
  doctorInfo,
}: AppointmentBookingCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prendre rendez-vous</CardTitle>
        <CardDescription>
          {doctorName && specialty
            ? `avec ${doctorName} - ${specialty}`
            : "Nouveau rendez-vous"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isLoggedIn ? (
          <LoginPrompt doctorName={doctorName} specialty={specialty} />
        ) : (
          <AppointmentHandler
            doctorName={doctorName}
            specialty={specialty}
            doctorInfo={doctorInfo}
          />
        )}
      </CardContent>
    </Card>
  );
};
