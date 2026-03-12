import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VideoCallRoom } from "@/components/teleconsultation/VideoCallRoom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const PatientTeleconsultation = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState<string>("Médecin");
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const validate = async () => {
      if (!appointmentId || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data: apt, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', appointmentId)
          .eq('patient_id', user.id)
          .eq('mode', 'teleconsultation')
          .single();

        if (error || !apt) {
          toast.error("Rendez-vous introuvable ou non autorisé.");
          setLoading(false);
          return;
        }

        // Get doctor name
        const { data: profile } = await supabase
          .rpc('get_safe_profile', { target_user_id: apt.doctor_id });
        const p = profile?.[0];
        if (p) {
          setDoctorName(`Dr. ${p.first_name || ''} ${p.last_name || ''}`.trim());
        }

        setValid(true);
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors de la vérification du rendez-vous.");
      } finally {
        setLoading(false);
      }
    };

    validate();
  }, [appointmentId, user?.id]);

  const handleEndCall = () => {
    navigate('/patient');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <p className="text-muted-foreground">Ce rendez-vous n'est pas accessible.</p>
        <Button variant="outline" onClick={() => navigate('/patient')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Button>
      </div>
    );
  }

  const patientName = `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() || 'Patient';

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/patient')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
        <div className="h-[calc(100vh-120px)]">
          <VideoCallRoom
            roomId={appointmentId!}
            userName={patientName}
            isDoctor={false}
            remoteName={doctorName}
            onEndCall={handleEndCall}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientTeleconsultation;
