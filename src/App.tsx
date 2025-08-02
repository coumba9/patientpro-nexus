
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthGuard>
                <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/find-doctor" element={<FindDoctor />} />
              <Route path="/book-appointment" element={<BookAppointment />} />
              <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Patient Routes */}
              <Route path="/patient/*" element={
                <ProtectedRoute requiredRole={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/patient/prescriptions" element={
                <ProtectedRoute requiredRole={['patient']}>
                  <Prescriptions />
                </ProtectedRoute>
              } />
              
              {/* Doctor Routes */}
              <Route path="/doctor" element={
                <ProtectedRoute requiredRole={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/doctor/messages" element={
                <ProtectedRoute requiredRole={['doctor']}>
                  <DoctorMessages />
                </ProtectedRoute>
              } />
              <Route path="/doctor/documents" element={
                <ProtectedRoute requiredRole={['doctor']}>
                  <DoctorDocuments />
                </ProtectedRoute>
              } />
              <Route path="/doctor/settings" element={
                <ProtectedRoute requiredRole={['doctor']}>
                  <DoctorSettings />
                </ProtectedRoute>
              } />
              <Route path="/doctor/patients" element={
                <ProtectedRoute requiredRole={['doctor']}>
                  <DoctorPatients />
                </ProtectedRoute>
              } />
              <Route path="/doctor/patients/:patientName" element={
                <ProtectedRoute requiredRole={['doctor']}>
                  <PatientDetails />
                </ProtectedRoute>
              } />
              <Route path="/doctor/teleconsultation" element={
                <ProtectedRoute requiredRole={['doctor']}>
                  <DoctorTeleconsultation />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requiredRole={['admin']}>
                  <Users />
                </ProtectedRoute>
              } />
              <Route path="/admin/moderation" element={
                <ProtectedRoute requiredRole={['admin']}>
                  <AdminModeration />
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute requiredRole={['admin']}>
                  <AdminAnalytics />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute requiredRole={['admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              } />
              <Route path="/admin/doctors" element={
                <ProtectedRoute requiredRole={['admin']}>
                  <DoctorManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/patients" element={
                <ProtectedRoute requiredRole={['admin']}>
                  <PatientsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/specialties" element={
                <ProtectedRoute requiredRole={['admin']}>
                  <Specialties />
                </ProtectedRoute>
              } />
              <Route path="/admin/notifications" element={
                <ProtectedRoute requiredRole={['admin']}>
                  <NotificationManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/payments" element={
                <ProtectedRoute requiredRole={['admin']}>
                  <PaymentManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/content" element={
                <ProtectedRoute requiredRole={['admin']}>
                  <ContentManagement />
                </ProtectedRoute>
              } />
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
              </AuthGuard>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
