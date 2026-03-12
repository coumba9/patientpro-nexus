import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingFallback from "@/components/LoadingFallback";

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FindDoctor = lazy(() => import("./pages/FindDoctor"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PatientDashboard = lazy(() => import("./pages/patient/Dashboard"));
const DoctorDashboard = lazy(() => import("./pages/doctor/Dashboard"));
const DoctorMessages = lazy(() => import("./pages/doctor/Messages"));
const DoctorDocuments = lazy(() => import("./pages/doctor/Documents"));
const DoctorSettings = lazy(() => import("./pages/doctor/Settings"));
const DoctorPatients = lazy(() => import("./pages/doctor/Patients"));
const DoctorTeleconsultation = lazy(() => import("./pages/doctor/Teleconsultation"));
const PatientDetails = lazy(() => import("./pages/doctor/PatientDetails"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminModeration = lazy(() => import("./pages/admin/Moderation"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const DoctorManagement = lazy(() => import("./pages/admin/DoctorManagement"));
const DoctorApplications = lazy(() => import("./pages/admin/DoctorApplications"));
const About = lazy(() => import("./pages/About"));
const Values = lazy(() => import("./pages/Values"));
const Contact = lazy(() => import("./pages/Contact"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Teleconsultation = lazy(() => import("./pages/Teleconsultation"));
const JoinUs = lazy(() => import("./pages/JoinUs"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Legal = lazy(() => import("./pages/Legal"));
const BookAppointment = lazy(() => import("./pages/BookAppointment").then(m => ({ default: m.BookAppointment })));
const Prescriptions = lazy(() => import("./pages/patient/Prescriptions"));
const Users = lazy(() => import("./pages/admin/Users"));
const PatientsPage = lazy(() => import("./pages/admin/Patients"));
const Specialties = lazy(() => import("./pages/admin/Specialties"));
const PaymentManagement = lazy(() => import("./pages/admin/PaymentManagement"));
const ContentManagement = lazy(() => import("./pages/admin/ContentManagement"));
const NotificationManagement = lazy(() => import("./pages/admin/NotificationManagement"));
const PaymentConfirmation = lazy(() => import("./pages/PaymentConfirmation"));
const DoctorAppointmentDetails = lazy(() => import("./pages/doctor/AppointmentDetails"));
const PatientAppointmentDetails = lazy(() => import("./pages/patient/AppointmentDetails"));
const PatientTeleconsultation = lazy(() => import("./pages/patient/Teleconsultation"));
const ChatbotWidget = lazy(() => import("@/components/patient/ChatbotWidget").then(m => ({ default: m.ChatbotWidget })));
const UmlDiagrams = lazy(() => import("./pages/UmlDiagrams"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Sonner />
              <BrowserRouter>
                <AuthGuard>
                  <Suspense fallback={<LoadingFallback />}>
                    <ChatbotWidget />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/find-doctor" element={<FindDoctor />} />
                      <Route path="/book-appointment" element={<BookAppointment />} />
                      <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/reset-password" element={<ResetPassword />} />

                      {/* Patient Routes */}
                      <Route path="/patient/teleconsultation/:appointmentId" element={
                        <ProtectedRoute requiredRole={['patient']}>
                          <PatientTeleconsultation />
                        </ProtectedRoute>
                      } />
                      <Route path="/patient/*" element={
                        <ProtectedRoute requiredRole={['patient']}>
                          <PatientDashboard />
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
                      <Route path="/doctor/appointment/:id" element={
                        <ProtectedRoute requiredRole={['doctor']}>
                          <DoctorAppointmentDetails />
                        </ProtectedRoute>
                      } />

                      {/* Admin Routes */}
                      <Route path="/admin" element={
                        <ProtectedRoute requiredRole={['admin']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin/dashboard" element={
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
                      <Route path="/admin/doctor-applications" element={
                        <ProtectedRoute requiredRole={['admin']}>
                          <DoctorApplications />
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

                      {/* Public Pages */}
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
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </AuthGuard>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
