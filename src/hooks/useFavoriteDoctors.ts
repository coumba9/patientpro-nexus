import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useFavoriteDoctors = () => {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (!user?.id) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorite_doctors' as any)
        .select('doctor_id')
        .eq('patient_id', user.id);

      if (error) throw error;
      setFavoriteIds(new Set((data || []).map((f: any) => f.doctor_id)));
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = useCallback(async (doctorId: string) => {
    if (!user?.id) {
      toast.error("Connectez-vous pour ajouter des favoris");
      return;
    }

    const isFav = favoriteIds.has(doctorId);

    // Optimistic update
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (isFav) next.delete(doctorId);
      else next.add(doctorId);
      return next;
    });

    try {
      if (isFav) {
        const { error } = await supabase
          .from('favorite_doctors' as any)
          .delete()
          .eq('patient_id', user.id)
          .eq('doctor_id', doctorId);
        if (error) throw error;
        toast.success("Médecin retiré des favoris");
      } else {
        const { error } = await supabase
          .from('favorite_doctors' as any)
          .insert({ patient_id: user.id, doctor_id: doctorId });
        if (error) throw error;
        toast.success("Médecin ajouté aux favoris");
      }
    } catch (error) {
      // Revert optimistic update
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (isFav) next.add(doctorId);
        else next.delete(doctorId);
        return next;
      });
      console.error('Error toggling favorite:', error);
      toast.error("Erreur lors de la mise à jour des favoris");
    }
  }, [user?.id, favoriteIds]);

  const isFavorite = useCallback((doctorId: string) => favoriteIds.has(doctorId), [favoriteIds]);

  return { favoriteIds, loading, toggleFavorite, isFavorite };
};
