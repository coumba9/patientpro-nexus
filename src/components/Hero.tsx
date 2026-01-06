import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { 
  Search, 
  MapPin, 
  Heart, 
  Calendar, 
  Video, 
  Stethoscope, 
  Baby, 
  Eye, 
  Bone,
  Activity,
  ArrowRight,
  Shield,
  Clock,
  Users,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { specialtyService } from "@/api/services/specialty.service";

// Popular specialties for quick access
const popularSpecialties = [
  { name: "Médecin généraliste", icon: Stethoscope, color: "bg-primary/10 text-primary" },
  { name: "Dentiste", icon: Activity, color: "bg-secondary/10 text-secondary" },
  { name: "Ophtalmologue", icon: Eye, color: "bg-medical-mint/10 text-medical-mint" },
  { name: "Gynécologue", icon: Heart, color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" },
  { name: "Pédiatre", icon: Baby, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  { name: "Kinésithérapeute", icon: Bone, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
];

interface Specialty {
  id: string;
  name: string;
  status: string;
}

export const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [doctorCount, setDoctorCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsResult, patientsResult, specialtiesData] = await Promise.all([
          supabase.from('doctors').select('id', { count: 'exact', head: true }),
          supabase.from('patients').select('id', { count: 'exact', head: true }),
          specialtyService.getActiveSpecialties()
        ]);
        setDoctorCount(doctorsResult.count || 0);
        setPatientCount(patientsResult.count || 0);
        setSpecialties(specialtiesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingSpecialties(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedSpecialty) params.set('specialty', selectedSpecialty);
    if (location) params.set('location', location);
    navigate(`/find-doctor?${params.toString()}`);
  };

  const handleSpecialtyClick = (specialty: string) => {
    navigate(`/find-doctor?specialty=${encodeURIComponent(specialty)}`);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--medical-mint)/0.1),transparent_50%)]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24">
        {/* Main Content */}
        <div className="text-center space-y-8">
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-card border border-border/50 px-4 py-2 rounded-full shadow-sm"
          >
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-primary" />
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{doctorCount > 0 ? doctorCount : '500+'}  médecins</span> vérifiés sur notre plateforme
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground">
              Prenez rendez-vous avec
              <br />
              <span className="gradient-text">un professionnel de santé</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Consultez en cabinet ou en téléconsultation, 24h/24 et 7j/7
            </p>
          </motion.div>

          {/* Search Section - Doctolib Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <form onSubmit={handleSearch} className="relative">
              <div className="bg-card rounded-2xl shadow-lg border border-border/50 p-2 md:p-3">
                <div className="flex flex-col md:flex-row gap-2 md:gap-0">
                  {/* Specialty Select Dropdown */}
                  <div className="flex-1 relative">
                    <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                    <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                      <SelectTrigger className="pl-12 pr-4 h-14 text-base md:text-lg border-0 bg-transparent focus:ring-0 focus:ring-offset-0 [&>span]:text-left">
                        <SelectValue placeholder="Choisir une spécialité..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        <SelectItem value="all">Toutes les spécialités</SelectItem>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty.id} value={specialty.name}>
                            {specialty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Divider */}
                  <div className="hidden md:block w-px bg-border my-2" />
                  
                  {/* Location Search */}
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Où ? (ville, code postal)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-12 pr-4 py-6 text-base md:text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
                    />
                  </div>
                  
                  {/* Search Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="md:ml-2 py-6 px-8 text-base md:text-lg rounded-xl bg-gradient-primary shadow-md hover:shadow-lg transition-all"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Rechercher
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Popular Specialties */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground">Recherches populaires :</p>
            <div className="flex flex-wrap justify-center gap-3">
              {popularSpecialties.map((specialty, index) => (
                <motion.button
                  key={specialty.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                  onClick={() => handleSpecialtyClick(specialty.name)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full ${specialty.color} hover:shadow-md transition-all hover:scale-105 border border-transparent hover:border-border/50`}
                >
                  <specialty.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{specialty.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <button
              onClick={() => navigate('/teleconsultation')}
              className="flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">Téléconsultation</div>
                <div className="text-sm text-muted-foreground">Consultez en vidéo</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => navigate('/find-doctor')}
              className="flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                <Calendar className="h-5 w-5 text-secondary" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">RDV en cabinet</div>
                <div className="text-sm text-muted-foreground">Près de chez vous</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
            </button>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16 pt-8 border-t border-border/50 mt-8"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-bold text-foreground">100%</div>
                <div className="text-xs text-muted-foreground">Sécurisé</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-bold text-foreground">24h/24</div>
                <div className="text-xs text-muted-foreground">Disponible</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-bold text-foreground">{patientCount > 0 ? `${patientCount}+` : '50k+'}</div>
                <div className="text-xs text-muted-foreground">Patients</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-bold text-foreground">{doctorCount > 0 ? `${doctorCount}+` : '500+'}</div>
                <div className="text-xs text-muted-foreground">Médecins</div>
              </div>
            </div>
          </motion.div>

          {/* Doctor CTA */}
          {!user && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm text-muted-foreground pt-4"
            >
              Vous êtes professionnel de santé ?{" "}
              <a href="/join-us" className="text-primary hover:underline font-semibold">
                Rejoignez JàmmSanté →
              </a>
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
};
