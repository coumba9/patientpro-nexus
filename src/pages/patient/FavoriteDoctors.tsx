import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useFavoriteDoctors } from "@/hooks/useFavoriteDoctors";
import DoctorCard from "@/components/doctor/DoctorCard";

interface FavoriteDoctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  availability: string;
  rating: number;
  rating_count?: number;
}

const FavoriteDoctors = () => {
  const navigate = useNavigate();
  const { favoriteIds, loading: favoritesLoading, toggleFavorite } = useFavoriteDoctors();
  const [doctors, setDoctors] = useState<FavoriteDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDoctors = async () => {
      if (favoritesLoading) return;

      const ids = Array.from(favoriteIds);
      if (ids.length === 0) {
        setDoctors([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const briefs = await Promise.all(
          ids.map(async (id) => {
            const { data } = await supabase.rpc('get_doctor_brief', { doctor_id: id });
            return Array.isArray(data) ? data[0] : data;
          })
        );

        const { data: statsData } = await supabase.rpc('get_doctor_rating_stats', {
          doctor_ids: ids,
        });

        const stats: Record<string, { average_rating: number; rating_count: number }> = {};
        (statsData || []).forEach((s: any) => {
          stats[s.doctor_id] = {
            average_rating: Number(s.average_rating) || 0,
            rating_count: Number(s.rating_count) || 0,
          };
        });

        const { data: locations } = await supabase
          .from('practice_locations')
          .select('doctor_id, city, address, is_primary')
          .in('doctor_id', ids);

        const locationByDoctor: Record<string, string> = {};
        (locations || []).forEach((loc: any) => {
          if (!locationByDoctor[loc.doctor_id] || loc.is_primary) {
            locationByDoctor[loc.doctor_id] = loc.city || loc.address || '';
          }
        });

        const list: FavoriteDoctor[] = briefs
          .filter(Boolean)
          .map((doc: any) => ({
            id: doc.id,
            name: `Dr. ${doc.first_name || ''} ${doc.last_name || ''}`.trim(),
            specialty: doc.specialty_name || 'Spécialité non définie',
            location: locationByDoctor[doc.id] || 'Adresse non renseignée',
            availability: 'Voir les disponibilités',
            rating: stats[doc.id]?.average_rating || 0,
            rating_count: stats[doc.id]?.rating_count || 0,
          }));

        setDoctors(list);
      } catch (error) {
        console.error('Erreur chargement favoris:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [favoriteIds, favoritesLoading]);

  const handleBooking = (doctor: { id: string; name: string; specialty: string }) => {
    navigate(
      `/book-appointment?doctorId=${encodeURIComponent(doctor.id)}&doctor=${encodeURIComponent(
        doctor.name
      )}&specialty=${encodeURIComponent(doctor.specialty)}`
    );
  };

  if (loading || favoritesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            Médecins favoris
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {doctors.length} médecin{doctors.length !== 1 ? 's' : ''} enregistré
            {doctors.length !== 1 ? 's' : ''} dans vos favoris
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/find-doctor')}>
          <Search className="h-4 w-4 mr-2" />
          Trouver un médecin
        </Button>
      </div>

      {doctors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card border border-border/50 rounded-2xl p-10 text-center"
        >
          <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-1">Aucun médecin favori</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Ajoutez des médecins à vos favoris depuis la recherche pour les retrouver ici.
          </p>
          <Button onClick={() => navigate('/find-doctor')}>Rechercher un médecin</Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onBooking={handleBooking}
              isFavorite
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteDoctors;
