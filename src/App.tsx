
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import AdminDashboard from "./pages/admin/Dashboard";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/find-doctor" element={<FindDoctor />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/patient/*" element={<PatientDashboard />} />
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/messages" element={<DoctorMessages />} />
          <Route path="/doctor/documents" element={<DoctorDocuments />} />
          <Route path="/doctor/settings" element={<DoctorSettings />} />
          <Route path="/doctor/patients" element={<DoctorPatients />} />
          <Route path="/doctor/teleconsultation" element={<DoctorTeleconsultation />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
