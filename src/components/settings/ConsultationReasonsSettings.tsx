import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Clock, ListChecks, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ConsultationReason {
  id: string;
  doctor_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_first_visit: boolean;
  allows_teleconsultation: boolean;
  is_active: boolean;
  sort_order: number;
}

const emptyForm = {
  name: "",
  description: "",
  duration_minutes: 30,
  price: 15000,
  is_first_visit: false,
  allows_teleconsultation: true,
  is_active: true,
  sort_order: 0,
};

const PRESETS = [
  { name: "1ère consultation", duration_minutes: 30, price: 15000, is_first_visit: true },
  { name: "Consultation de suivi", duration_minutes: 20, price: 12000, is_first_visit: false },
  { name: "Renouvellement d'ordonnance", duration_minutes: 10, price: 8000, is_first_visit: false },
  { name: "Urgence", duration_minutes: 30, price: 20000, is_first_visit: false },
];

export const ConsultationReasonsSettings = () => {
  const { user } = useAuth();
  const [reasons, setReasons] = useState<ConsultationReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("consultation_reasons" as any)
      .select("*")
      .eq("doctor_id", user.id)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des motifs");
    } else {
      setReasons((data as any[] as ConsultationReason[]) || []);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, sort_order: reasons.length });
    setOpen(true);
  };

  const openEdit = (r: ConsultationReason) => {
    setEditingId(r.id);
    setForm({
      name: r.name,
      description: r.description || "",
      duration_minutes: r.duration_minutes,
      price: Number(r.price),
      is_first_visit: r.is_first_visit,
      allows_teleconsultation: r.allows_teleconsultation,
      is_active: r.is_active,
      sort_order: r.sort_order,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    if (!form.name.trim()) {
      toast.error("Le nom du motif est obligatoire");
      return;
    }
    if (form.duration_minutes < 5) {
      toast.error("La durée doit être d'au moins 5 minutes");
      return;
    }

    const payload: any = {
      doctor_id: user.id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      duration_minutes: form.duration_minutes,
      price: form.price,
      is_first_visit: form.is_first_visit,
      allows_teleconsultation: form.allows_teleconsultation,
      is_active: form.is_active,
      sort_order: form.sort_order,
    };

    const { error } = editingId
      ? await supabase.from("consultation_reasons" as any).update(payload).eq("id", editingId)
      : await supabase.from("consultation_reasons" as any).insert(payload);

    if (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement du motif");
      return;
    }

    toast.success(editingId ? "Motif mis à jour" : "Motif ajouté");
    setOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("consultation_reasons" as any).delete().eq("id", id);
    if (error) {
      toast.error("Impossible de supprimer ce motif");
      return;
    }
    toast.success("Motif supprimé");
    load();
  };

  const addPresets = async () => {
    if (!user?.id) return;
    const payload = PRESETS.map((p, i) => ({
      doctor_id: user.id,
      name: p.name,
      duration_minutes: p.duration_minutes,
      price: p.price,
      is_first_visit: p.is_first_visit,
      sort_order: reasons.length + i,
    }));
    const { error } = await supabase.from("consultation_reasons" as any).insert(payload as any);
    if (error) {
      toast.error("Erreur lors de l'ajout des motifs par défaut");
      return;
    }
    toast.success("Motifs par défaut ajoutés");
    load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Motifs de consultation
          </CardTitle>
          <CardDescription>
            Définissez vos motifs (1ère consultation, suivi, renouvellement d'ordonnance…) avec une
            durée et un tarif propres à chacun.
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {reasons.length === 0 && !loading && (
            <Button variant="outline" size="sm" onClick={addPresets}>
              Motifs par défaut
            </Button>
          )}
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : reasons.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun motif défini. Les patients verront les types de consultation génériques.
          </p>
        ) : (
          reasons.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-4 rounded-lg border p-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{r.name}</span>
                  {r.is_first_visit && <Badge variant="secondary">1ère visite</Badge>}
                  {r.allows_teleconsultation && <Badge variant="outline">Téléconsultation</Badge>}
                  {!r.is_active && <Badge variant="outline">Inactif</Badge>}
                </div>
                {r.description && (
                  <p className="text-sm text-muted-foreground">{r.description}</p>
                )}
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {r.duration_minutes} min · {Number(r.price).toLocaleString("fr-FR")} FCFA
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier le motif" : "Nouveau motif"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom du motif</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="1ère consultation"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optionnelle)</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Durée (minutes)</Label>
                <Input
                  type="number"
                  min={5}
                  step={5}
                  value={form.duration_minutes}
                  onChange={(e) =>
                    setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Tarif (FCFA)</Label>
                <Input
                  type="number"
                  min={0}
                  step={500}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label>Première visite</Label>
              <Switch
                checked={form.is_first_visit}
                onCheckedChange={(v) => setForm({ ...form, is_first_visit: v })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label>Disponible en téléconsultation</Label>
              <Switch
                checked={form.allows_teleconsultation}
                onCheckedChange={(v) => setForm({ ...form, allows_teleconsultation: v })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label>Actif</Label>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>
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
