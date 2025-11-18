import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAdminNotifications = (userId: string | null) => {
  const [newApplicationsCount, setNewApplicationsCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial count
    const fetchCount = async () => {
      const { count } = await supabase
        .from('doctor_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      setNewApplicationsCount(count || 0);
    };

    fetchCount();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('doctor-applications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'doctor_applications'
        },
        (payload) => {
          setNewApplicationsCount(prev => prev + 1);
          toast.info(
            `Nouvelle demande de médecin : Dr ${payload.new.first_name} ${payload.new.last_name}`,
            {
              description: "Consultez la page Demandes de médecins pour plus de détails",
              duration: 5000,
            }
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'doctor_applications',
          filter: 'status=eq.pending'
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { newApplicationsCount };
};
