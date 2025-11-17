import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
}

export const RatingDialog = ({
  open,
  onOpenChange,
  appointmentId,
  doctorId,
  doctorName,
}: RatingDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Veuillez sélectionner une note");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase.from("ratings").insert({
        patient_id: user.id,
        doctor_id: doctorId,
        appointment_id: appointmentId,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      toast.success("Merci pour votre évaluation !");
      onOpenChange(false);
      setRating(0);
      setComment("");
    } catch (error: any) {
      console.error("Erreur lors de la notation:", error);
      if (error.message?.includes("duplicate")) {
        toast.error("Vous avez déjà noté ce rendez-vous");
      } else {
        toast.error("Erreur lors de l'enregistrement de votre note");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Évaluer Dr. {doctorName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Comment évaluez-vous votre expérience avec ce médecin ?
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm font-medium">
                {rating === 1 && "Très insatisfait"}
                {rating === 2 && "Insatisfait"}
                {rating === 3 && "Neutre"}
                {rating === 4 && "Satisfait"}
                {rating === 5 && "Très satisfait"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Commentaire (optionnel)
            </label>
            <Textarea
              placeholder="Partagez votre expérience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading || rating === 0}>
            {loading ? "Enregistrement..." : "Envoyer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
