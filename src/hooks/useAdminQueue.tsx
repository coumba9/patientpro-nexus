import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface QueueEntry {
  id: string;
  patient_id: string;
  patient_name?: string;
  requested_doctor_id?: string;
  doctor_name?: string;
  specialty_id?: string;
  specialty_name?: string;
  preferred_dates?: string[];
  urgency: string;
  status: string;
  notes?: string;
  created_at: string;
}

export const useAdminQueue = () => {
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    waiting: 0,
    processed: 0,
    urgent: 0,
  });

  useEffect(() => {
    fetchQueueData();

    // Set up realtime subscription
    const channel = supabase
      .channel("queue-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue_entries",
        },
        () => {
          fetchQueueData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchQueueData = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("queue_entries")
        .select(`
          *,
          specialties(name),
          profiles!queue_entries_patient_id_fkey(first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Format entries with names
      const formattedEntries = await Promise.all(
        (data || []).map(async (entry: any) => {
          let doctorName = undefined;
          if (entry.requested_doctor_id) {
            const { data: doctorProfile } = await supabase
              .from("profiles")
              .select("first_name, last_name")
              .eq("id", entry.requested_doctor_id)
              .single();

            if (doctorProfile) {
              doctorName = `Dr. ${doctorProfile.first_name} ${doctorProfile.last_name}`;
            }
          }

          return {
            id: entry.id,
            patient_id: entry.patient_id,
            patient_name: entry.profiles
              ? `${entry.profiles.first_name} ${entry.profiles.last_name}`
              : "Patient inconnu",
            requested_doctor_id: entry.requested_doctor_id,
            doctor_name: doctorName,
            specialty_id: entry.specialty_id,
            specialty_name: entry.specialties?.name || "Non spécifié",
            preferred_dates: entry.preferred_dates,
            urgency: entry.urgency,
            status: entry.status,
            notes: entry.notes,
            created_at: entry.created_at,
          };
        })
      );

      setQueueEntries(formattedEntries);

      // Calculate stats
      const waiting = formattedEntries.filter((e) => e.status === "waiting").length;
      const processed = formattedEntries.filter((e) => e.status !== "waiting").length;
      const urgent = formattedEntries.filter((e) => e.urgency === "urgent").length;

      setStats({ waiting, processed, urgent });
    } catch (error) {
      console.error("Error fetching queue data:", error);
    } finally {
      setLoading(false);
    }
  };

  return { queueEntries, stats, loading, refetch: fetchQueueData };
};
