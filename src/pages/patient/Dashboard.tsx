import { Button } from "@/components/ui/button";
import {
  Calendar,
  MessageCircle,
  FileText,
  Settings,
  Clock,
  MapPin,
} from "lucide-react";
import { Link, Route, Routes } from "react-router-dom";
import { useState } from "react";

interface Appointment {
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  type: string;
}

const mockAppointments: Appointment[] = [
  {
    id: 1,
    doctor: "Dr. Sarah Martin",
    specialty: "Cardiologue",
    date: "2024-02-20",
    time: "14:30",
    location: "Paris",
    type: "Consultation",
  },
  {
    id: 2,
    doctor: "Dr. Thomas Bernard",
    specialty: "Dermatologue",
    date: "2024-02-25",
    time: "10:00",
    location: "Lyon",
    type: "Suivi",
  },
];

const PatientDashboard = () => {
  const [appointments] = useState<Appointment[]>(mockAppointments);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <Link to="/patient">
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <Calendar className="mr-2 h-5 w-5" />
                Mes rendez-vous
              </Button>
            </Link>
            <Link to="/patient/messages">
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Messages
              </Button>
            </Link>
            <Link to="/patient/documents">
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <FileText className="mr-2 h-5 w-5" />
                Documents
              </Button>
            </Link>
            <Link to="/patient/settings">
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <Settings className="mr-2 h-5 w-5" />
                Paramètres
              </Button>
            </Link>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Mes prochains rendez-vous</h2>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div>
                      <h3 className="font-semibold">{appointment.doctor}</h3>
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
                    <div className="space-x-2">
                      <Button variant="outline">Reporter</Button>
                      <Button variant="destructive">Annuler</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;