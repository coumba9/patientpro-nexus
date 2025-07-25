
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { withAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FindDoctor from "./pages/FindDoctor";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/patient/Dashboard";
import DoctorDashboard from "./pages/doctor/Dashboard";
import DoctorMessages from "./pages/doctor/Messages";
import DoctorDocuments from "./pages/doctor/Documents";
import DoctorSettings from "./pages/doctor/Settings";
import DoctorPatients from "./pages/doctor/Patients";
import DoctorTeleconsultation from "./pages/doctor/Teleconsultation";
import PatientDetails from "./pages/doctor/PatientDetails";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminModeration from "./pages/admin/Moderation";
import AdminSettings from "./pages/admin/Settings";
import AdminAnalytics from "./pages/admin/Analytics";
import DoctorManagement from "./pages/admin/DoctorManagement";
import About from "./pages/About";
import Values from "./pages/Values";
import Contact from "./pages/Contact";
import HowItWorks from "./pages/HowItWorks";
import Teleconsultation from "./pages/Teleconsultation";
import JoinUs from "./pages/JoinUs";
import Pricing from "./pages/Pricing";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Legal from "./pages/Legal";
import { BookAppointment } from "./pages/BookAppointment";
import UmlDiagrams from "./pages/UmlDiagrams";
import Prescriptions from "./pages/patient/Prescriptions";
import Users from "./pages/admin/Users";
import PatientsPage from "./pages/admin/Patients";
import Specialties from "./pages/admin/Specialties";
import PaymentManagement from "./pages/admin/PaymentManagement";
import ContentManagement from "./pages/admin/ContentManagement";
import NotificationManagement from "./pages/admin/NotificationManagement";
import PaymentConfirmation from "./pages/PaymentConfirmation";

const queryClient = new QueryClient();

const App = () => {
  // Ajouter des logs pour déboguer le routage
  console.log("App component loaded");
  console.log("Current location:", window.location.pathname);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/find-doctor" element={<FindDoctor />} />
              <Route path="/book-appointment" element={<BookAppointment />} />
              <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/patient/*" element={<PatientDashboard />} />
              <Route path="/patient/prescriptions" element={<Prescriptions />} />
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/messages" element={<DoctorMessages />} />
              <Route path="/doctor/documents" element={<DoctorDocuments />} />
              <Route path="/doctor/settings" element={<DoctorSettings />} />
              <Route path="/doctor/patients" element={<DoctorPatients />} />
              <Route path="/doctor/patients/:patientName" element={<PatientDetails />} />
              <Route path="/doctor/teleconsultation" element={<DoctorTeleconsultation />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/moderation" element={<AdminModeration />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/doctors" element={<DoctorManagement />} />
              <Route path="/admin/patients" element={<PatientsPage />} />
              <Route path="/admin/specialties" element={<Specialties />} />
              <Route path="/admin/notifications" element={<NotificationManagement />} />
              <Route path="/admin/payments" element={<PaymentManagement />} />
              <Route path="/admin/content" element={<ContentManagement />} />
              <Route path="/about" element={<About />} />
              <Route path="/values" element={<Values />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/teleconsultation" element={<Teleconsultation />} />
              <Route path="/join-us" element={<JoinUs />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/uml-diagrams" element={<UmlDiagrams />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default withAuth(App);
