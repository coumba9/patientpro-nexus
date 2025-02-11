
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MessageCircle,
  FileText,
  Settings,
  Clock,
  MapPin,
  Heart,
  Pill,
  ClipboardList,
  User,
} from "lucide-react";
import { Link, Route, Routes } from "react-router-dom";
import { useState } from "react";
import Messages from "./Messages";
import Documents from "./Documents";
import SettingsPage from "./Settings";
import Profile from "./Profile";
import MedicalHistory from "./MedicalHistory";
import Prescriptions from "./Prescriptions";
import AppointmentTickets from "./AppointmentTickets";

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

const Appointments = () => {
  const [appointments] = useState<Appointment[]>(mockAppointments);

  return (
    <div className="space-y-6">
      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Prochains RDV</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{appointments.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Messages non lus</h3>
          </div>
          <p className="text-2xl font-bold mt-2">3</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Documents</h3>
          </div>
          <p className="text-2xl font-bold mt-2">5</p>
        </div>
      </div>

      {/* Liste des rendez-vous */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mes prochains rendez-vous</h2>
          <Link to="/book-appointment">
            <Button>Prendre un rendez-vous</Button>
          </Link>
        </div>
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
  );
};

const PatientDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-2">
            <h2 className="font-semibold text-lg mb-4">Menu Patient</h2>
            <Link to="/patient">
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <Calendar className="mr-2 h-5 w-5" />
                Mes rendez-vous
              </Button>
            </Link>
            <Link to="/patient/tickets">
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <ClipboardList className="mr-2 h-5 w-5" />
                Mes tickets
              </Button>
            </Link>
            <Link to="/patient/profile">
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <User className="mr-2 h-5 w-5" />
                Mon profil
              </Button>
            </Link>
            <Link to="/patient/medical-history">
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <Heart className="mr-2 h-5 w-5" />
                Dossier médical
              </Button>
            </Link>
            <Link to="/patient/prescriptions">
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <Pill className="mr-2 h-5 w-5" />
                Ordonnances
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
            <Routes>
              <Route path="/" element={<Appointments />} />
              <Route path="/tickets" element={<AppointmentTickets />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/medical-history" element={<MedicalHistory />} />
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
