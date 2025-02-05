import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  MessageCircle,
  FileText,
  Settings,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";

const appointments = [
  {
    id: 1,
    patient: "Marie Dubois",
    date: "2024-02-20",
    time: "14:30",
    type: "Consultation",
    status: "confirmed",
  },
  {
    id: 2,
    patient: "Jean Martin",
    date: "2024-02-20",
    time: "15:00",
    type: "Suivi",
    status: "pending",
  },
];

const DoctorDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <Link to="/doctor">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Agenda
              </Button>
            </Link>
            <Link to="/doctor/patients">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <Users className="mr-2 h-5 w-5" />
                Patients
              </Button>
            </Link>
            <Link to="/doctor/teleconsultation">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <Video className="mr-2 h-5 w-5" />
                Téléconsultation
              </Button>
            </Link>
            <Link to="/doctor/messages">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Messages
              </Button>
            </Link>
            <Link to="/doctor/documents">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <FileText className="mr-2 h-5 w-5" />
                Documents
              </Button>
            </Link>
            <Link to="/doctor/settings">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="lg"
              >
                <Settings className="mr-2 h-5 w-5" />
                Paramètres
              </Button>
            </Link>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Rendez-vous du jour</h2>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold">{appointment.patient}</h3>
                      <p className="text-gray-600">
                        {appointment.time} - {appointment.type}
                      </p>
                      <span
                        className={`text-sm ${
                          appointment.status === "confirmed"
                            ? "text-green-500"
                            : "text-yellow-500"
                        }`}
                      >
                        {appointment.status === "confirmed"
                          ? "Confirmé"
                          : "En attente"}
                      </span>
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline">Voir détails</Button>
                      {appointment.status === "pending" && (
                        <Button>Confirmer</Button>
                      )}
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

export default DoctorDashboard;