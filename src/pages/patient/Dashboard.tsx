
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { PatientSidebar } from "@/components/patient/PatientSidebar";
import { NavigationHeader } from "@/components/patient/NavigationHeader";
import { AppointmentsPage } from "@/components/patient/AppointmentsPage";
import Messages from "./Messages";
import Documents from "./Documents";
import SettingsPage from "./Settings";
import Profile from "./Profile";
import MedicalHistory from "./MedicalHistory";
import Prescriptions from "./Prescriptions";
import AppointmentTickets from "./AppointmentTickets";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/patient";
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loginStatus);
    
    if (!loginStatus) {
      toast.error("Veuillez vous connecter");
      navigate("/login");
    }
  }, [navigate]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <NavigationHeader isHomePage={isHomePage} onBack={() => navigate(-1)} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div>
            <PatientSidebar />
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <Routes>
              <Route path="/" element={<AppointmentsPage />} />
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
