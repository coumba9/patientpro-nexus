import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, CalendarOff, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AbsencePeriod {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  type: string;
  is_full_day: boolean;
  start_time: string | null;
  end_time: string | null;
}

const ABSENCE_TYPES = [
  { value: "conge", label: "Congé" },
  { value: "ferie", label: "Jour férié" },
  { value: "formation", label: "Formation / congrès" },
  { value: "ponctuelle", label: "Absence ponctuelle" },
];

const todayStr = () => new Date().toISOString().split("T")[0];

const emptyForm = {
  start_date: todayStr(),
  end_date: todayStr(),
  reason: "",
  type: "conge",
  is_full_day: true,
  start_time: "09:00",
  end_time: "12:00",
};

export const AbsenceSettings = () => {
  const { user } = useAuth();
  const [periods, setPeriods] = useState<AbsencePeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [conflicts, setConflicts] = useState<number>(0);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("doctor_unavailability_periods" as any)
      .select("*")
      .eq("doctor_id", user.id)
      .order("start_date", { ascending: true });

    if (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des absences");
    } else {
      setPeriods((data as any[] as AbsencePeriod[]) || []);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  // Détecte les rendez-vous déjà publiés dans la période saisie
  useEffect(() => {
    const check = async () => {
      if (!user?.id || !open) return;
      const { data } = await supabase
        .from("appointments")
        .select("id")
        .eq("doctor_id", user.id)
        .gte("date", form.start_date)
        .lte("date", form.end_date)
        .in("status", ["pending", "confirmed"]);
      setConflicts((data || []).length);
    };
    check();
  }, [user?.id, open, form.start_date, form.end_date]);

  const handleSave = async () => {
    if (!user?.id) return;
    if (!form.reason.trim()) {
      toast.error("Veuillez préciser le motif de l'absence");
      return;
    }
    if (form.end_date < form.start_date) {
      toast.error("La date de fin doit être postérieure à la date de début");
      return;
    }
    if (!form.is_full_day && form.end_time <= form.start_time) {
      toast.error("L'heure de fin doit être postérieure à l'heure de début");
      return;
    }

    const { error } = await supabase.from("doctor_unavailability_periods" as any).insert({
      doctor_id: user.id,
      start_date: form.start_date,
      end_date: form.end_date,
      reason: form.reason.trim(),
      type: form.type,
      is_full_day: form.is_full_day,
      start_time: form.is_full_day ? null : form.start_time,
      end_time: form.is_full_day ? null : form.end_time,
    } as any);

    if (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement de l'absence");
      return;
    }

    toast.success(
      conflicts > 0
        ? `Absence enregistrée. ${conflicts} rendez-vous déjà pris sont à replanifier.`
        : "Absence enregistrée"
    );
    setForm({ ...emptyForm });
    setOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("doctor_unavailability_periods" as any)
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Impossible de supprimer cette absence");
      return;
    }
    toast.success("Absence supprimée");
    load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarOff className="h-5 w-5" />
            Congés et indisponibilités exceptionnelles
          </CardTitle>
          <CardDescription>
            Bloquez des jours fériés, des congés ou une absence de quelques heures, indépendamment de
            vos disponibilités récurrentes.
          </CardDescription>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : periods.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune absence programmée.</p>
        ) : (
          periods.map((p) => (
            <div key={p.id} className="flex items-start justify-between gap-4 rounded-lg border p-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{p.reason}</span>
                  <Badge variant="secondary">
                    {ABSENCE_TYPES.find((t) => t.value === p.type)?.label || p.type}
                  </Badge>
                  {!p.is_full_day && <Badge variant="outline">Partielle</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Du {format(new Date(p.start_date), "d MMMM yyyy", { locale: fr })} au{" "}
                  {format(new Date(p.end_date), "d MMMM yyyy", { locale: fr })}
                  {!p.is_full_day &&
                    p.start_time &&
                    p.end_time &&
                    ` · ${p.start_time.substring(0, 5)} - ${p.end_time.substring(0, 5)}`}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle indisponibilité</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ABSENCE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Du</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Au</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label>Journée entière</Label>
                <p className="text-xs text-muted-foreground">
                  Désactivez pour bloquer seulement une plage horaire
                </p>
              </div>
              <Switch
                checked={form.is_full_day}
                onCheckedChange={(v) => setForm({ ...form, is_full_day: v })}
              />
            </div>
            {!form.is_full_day && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Heure de début</Label>
                  <Input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heure de fin</Label>
                  <Input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Motif</Label>
              <Input
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Congés annuels, Tabaski, formation..."
              />
            </div>
            {conflicts > 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
                <span>
                  {conflicts} rendez-vous déjà confirmé(s) sur cette période. Pensez à les reporter
                  ou à les annuler après enregistrement.
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
