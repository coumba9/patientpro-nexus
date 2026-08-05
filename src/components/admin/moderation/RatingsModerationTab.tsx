import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Star, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface RatingRow {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  moderation_status: string;
  moderation_reason: string | null;
  patient_id: string;
  doctor_id: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Publié",
  rejected: "Rejeté",
};

export const RatingsModerationTab = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState("pending");
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<RatingRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ratings" as any)
      .select("*")
      .eq("moderation_status", status)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des avis");
    } else {
      setRatings((data as any[] as RatingRow[]) || []);
    }
    setLoading(false);
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const moderate = async (id: string, newStatus: string, reason?: string) => {
    const { error } = await supabase
      .from("ratings" as any)
      .update({
        moderation_status: newStatus,
        moderated_by: user?.id ?? null,
        moderated_at: new Date().toISOString(),
        moderation_reason: reason ?? null,
      } as any)
      .eq("id", id);

    if (error) {
      console.error(error);
      toast.error("Erreur lors de la modération de l'avis");
      return;
    }
    toast.success(newStatus === "approved" ? "Avis publié" : "Avis rejeté");
    setRejectTarget(null);
    setRejectReason("");
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Modération des avis</h3>
        <p className="text-sm text-muted-foreground">
          Les avis patients ne sont visibles publiquement qu'après validation.
        </p>
      </div>

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="approved">Publiés</TabsTrigger>
          <TabsTrigger value="rejected">Rejetés</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : ratings.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun avis {STATUS_LABELS[status]?.toLowerCase()}.</p>
      ) : (
        <div className="space-y-3">
          {ratings.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < r.rating ? "fill-primary text-primary" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <Badge variant="secondary">{STATUS_LABELS[r.moderation_status]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(r.created_at), "d MMM yyyy", { locale: fr })}
                    </span>
                  </div>
                  <p className="text-sm">{r.comment || "(aucun commentaire)"}</p>
                  {r.moderation_reason && (
                    <p className="text-xs text-muted-foreground">
                      Motif de rejet : {r.moderation_reason}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {r.moderation_status !== "approved" && (
                    <Button size="sm" onClick={() => moderate(r.id, "approved")}>
                      <Check className="mr-1 h-4 w-4" />
                      Publier
                    </Button>
                  )}
                  {r.moderation_status !== "rejected" && (
                    <Button size="sm" variant="outline" onClick={() => setRejectTarget(r)}>
                      <X className="mr-1 h-4 w-4" />
                      Rejeter
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter cet avis</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motif du rejet (propos injurieux, hors sujet, données personnelles...)"
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                rejectTarget && moderate(rejectTarget.id, "rejected", rejectReason.trim() || undefined)
              }
            >
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
