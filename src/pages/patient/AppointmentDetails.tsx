import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { appointmentService } from "@/api";
import { Loader2, ArrowLeft, Calendar, Clock, User, MapPin, FileText, Star } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { RatingDialog } from "@/components/appointment/RatingDialog";
import { LocationMap } from "@/components/appointment/LocationMap";
import { supabase } from "@/integrations/supabase/client";

const AppointmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [hasRating, setHasRating] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id) return;
      
      try {
        const data = await appointmentService.getById(id);
        setAppointment(data);

        // Vérifier si le patient a déjà noté ce rendez-vous
        const { data: ratingData } = await supabase
          .from("ratings")
          .select("id")
          .eq("appointment_id", id)
          .single();

        setHasRating(!!ratingData);
      } catch (error) {
        console.error("Error fetching appointment:", error);
        toast.error("Erreur lors du chargement du rendez-vous");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Rendez-vous non trouvé</p>
            <Button onClick={() => navigate("/patient")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const doctorName = appointment.doctor?.profile 
    ? `Dr. ${appointment.doctor.profile.first_name} ${appointment.doctor.profile.last_name}`
    : "Médecin inconnu";

  const specialty = appointment.doctor?.specialty?.name || 
                    appointment.doctor?.specialties?.name || 
                    "Spécialité non définie";

  const statusColors = {
    pending: "bg-yellow-500",
    confirmed: "bg-green-500",
    cancelled: "bg-red-500",
    completed: "bg-blue-500"
  };

  const statusLabels = {
    pending: "En attente",
    confirmed: "Confirmé",
    cancelled: "Annulé",
    completed: "Terminé"
  };

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/patient")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Détails du rendez-vous</CardTitle>
            <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
              {statusLabels[appointment.status as keyof typeof statusLabels]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Médecin</p>
                <p className="text-lg font-semibold">{doctorName}</p>
                <p className="text-sm text-muted-foreground">{specialty}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-lg font-semibold">
                  {format(new Date(appointment.date), "dd MMMM yyyy", { locale: fr })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Heure</p>
                <p className="text-lg font-semibold">{appointment.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lieu</p>
                <p className="text-lg font-semibold">
                  {appointment.mode === "presentiel" ? appointment.location || "Cabinet" : "Téléconsultation"}
                </p>
                {appointment.mode === "presentiel" && appointment.doctor?.address && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {appointment.doctor.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {appointment.mode === "presentiel" && 
           appointment.doctor?.latitude && 
           appointment.doctor?.longitude && (
            <div className="border-t pt-4">
              <LocationMap
                address={appointment.doctor.address}
                latitude={appointment.doctor.latitude}
                longitude={appointment.doctor.longitude}
                doctorName={doctorName}
              />
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Type de consultation</p>
                <Badge variant="outline">{appointment.type}</Badge>
              </div>
            </div>
          </div>

          {appointment.notes && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
              <p className="text-sm bg-muted p-3 rounded-md">{appointment.notes}</p>
            </div>
          )}

          {appointment.cancelled_at && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Informations d'annulation</p>
              <div className="bg-red-50 p-3 rounded-md space-y-1">
                <p className="text-sm">
                  <strong>Annulé le:</strong> {format(new Date(appointment.cancelled_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                </p>
                {appointment.cancellation_reason && (
                  <p className="text-sm">
                    <strong>Raison:</strong> {appointment.cancellation_reason}
                  </p>
                )}
              </div>
            </div>
          )}

          {appointment.status === "completed" && (
            <div className="border-t pt-4">
              <Button
                onClick={() => setRatingDialogOpen(true)}
                disabled={hasRating}
                className="w-full gap-2"
                variant={hasRating ? "outline" : "default"}
              >
                <Star className={`h-4 w-4 ${hasRating ? "fill-yellow-400 text-yellow-400" : ""}`} />
                {hasRating ? "Vous avez déjà noté ce rendez-vous" : "Évaluer ce médecin"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {appointment && (
        <RatingDialog
          open={ratingDialogOpen}
          onOpenChange={setRatingDialogOpen}
          appointmentId={appointment.id}
          doctorId={appointment.doctor_id}
          doctorName={doctorName}
        />
      )}
    </div>
  );
};

export default AppointmentDetails;
