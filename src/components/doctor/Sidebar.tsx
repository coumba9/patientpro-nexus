
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  MessageCircle,
  FileText,
  Settings,
  Video,
} from "lucide-react";

export const DoctorSidebar = () => {
  return (
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
  );
};
