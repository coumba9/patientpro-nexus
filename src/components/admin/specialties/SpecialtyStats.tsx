
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Stethoscope, 
  UserCheck, 
  Calendar, 
  TrendingUp,
  Loader2
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const SpecialtyStats = () => {
  const [stats, setStats] = useState({
    totalSpecialties: 0,
    totalDoctors: 0,
    mostPopularSpecialty: "",
    doctorsGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch total specialties
        const { data: specialties, error: specialtiesError } = await supabase
          .from('specialties')
          .select('*');
          
        if (specialtiesError) throw specialtiesError;
        
        // Get total doctors from specialties
        let totalDoctors = 0;
        let mostPopularSpecialty = "";
        let maxDoctors = 0;
        
        specialties.forEach(specialty => {
          totalDoctors += specialty.total_doctors || 0;
          
          if ((specialty.total_doctors || 0) > maxDoctors) {
            maxDoctors = specialty.total_doctors || 0;
            mostPopularSpecialty = specialty.name;
          }
        });
        
        // Set the stats
        setStats({
          totalSpecialties: specialties.length,
          totalDoctors,
          mostPopularSpecialty: mostPopularSpecialty || "Aucune",
          doctorsGrowth: 8 // Fake data for now
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
              </CardTitle>
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Spécialités
          </CardTitle>
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSpecialties}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalSpecialties > 20 ? "+3 depuis le mois dernier" : "Ajoutez plus de spécialités"}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Médecins Spécialistes
          </CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDoctors}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.doctorsGrowth} depuis le mois dernier
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Rendez-vous par Spécialité
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">187</div>
          <p className="text-xs text-muted-foreground">
            +32 depuis le mois dernier
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Spécialité en Croissance
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.mostPopularSpecialty}</div>
          <p className="text-xs text-muted-foreground">
            +45% de rendez-vous ce mois
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpecialtyStats;
