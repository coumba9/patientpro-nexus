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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PracticeLocation {
  id: string;
  doctor_id: string;
  name: string;
  type: string;
  address: string;
  city: string | null;
  postal_code: string | null;
  phone_number: string | null;
  latitude: number | null;
  longitude: number | null;
  is_primary: boolean;
  is_active: boolean;
}

const LOCATION_TYPES = [
  { value: "cabinet", label: "Cabinet privé" },
  { value: "clinique", label: "Clinique" },
  { value: "hopital", label: "Hôpital" },
  { value: "centre_sante", label: "Centre de santé" },
];

const emptyForm = {
  name: "",
  type: "cabinet",
  address: "",
  city: "",
  postal_code: "",
  phone_number: "",
  is_primary: false,
  is_active: true,
};

export const PracticeLocationsSettings = () => {
  const { user } = useAuth();
  const [locations, setLocations] = useState<PracticeLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("practice_locations" as any)
      .select("*")
      .eq("doctor_id", user.id)
      .order("is_primary", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des lieux d'exercice");
    } else {
      setLocations((data as any[] as PracticeLocation[]) || []);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, is_primary: locations.length === 0 });
    setOpen(true);
  };

  const openEdit = (loc: PracticeLocation) => {
    setEditingId(loc.id);
    setForm({
      name: loc.name,
      type: loc.type,
      address: loc.address,
      city: loc.city || "",
      postal_code: loc.postal_code || "",
      phone_number: loc.phone_number || "",
      is_primary: loc.is_primary,
      is_active: loc.is_active,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    if (!form.name.trim() || !form.address.trim()) {
      toast.error("Le nom et l'adresse sont obligatoires");
      return;
    }

    const payload: any = {
      doctor_id: user.id,
      name: form.name.trim(),
      type: form.type,
      address: form.address.trim(),
      city: form.city.trim() || null,
      postal_code: form.postal_code.trim() || null,
      phone_number: form.phone_number.trim() || null,
      is_primary: form.is_primary,
      is_active: form.is_active,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase
        .from("practice_locations" as any)
        .update(payload)
        .eq("id", editingId));
    } else {
      ({ error } = await supabase.from("practice_locations" as any).insert(payload));
    }

    if (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement du lieu");
      return;
    }

    // Un seul lieu principal
    if (form.is_primary) {
      await supabase
        .from("practice_locations" as any)
        .update({ is_primary: false } as any)
        .eq("doctor_id", user.id)
        .neq("name", payload.name);
    }

    toast.success(editingId ? "Lieu mis à jour" : "Lieu ajouté");
    setOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("practice_locations" as any).delete().eq("id", id);
    if (error) {
      toast.error("Impossible de supprimer ce lieu");
      return;
    }
    toast.success("Lieu supprimé");
    load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Lieux d'exercice
          </CardTitle>
          <CardDescription>
            Gérez vos cabinets, cliniques et établissements. Chaque lieu a sa propre adresse et peut
            être associé à vos créneaux de disponibilité.
          </CardDescription>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : locations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun lieu d'exercice enregistré. Ajoutez votre cabinet principal.
          </p>
        ) : (
          locations.map((loc) => (
            <div
              key={loc.id}
              className="flex items-start justify-between gap-4 rounded-lg border p-4"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{loc.name}</span>
                  <Badge variant="secondary">
                    {LOCATION_TYPES.find((t) => t.value === loc.type)?.label || loc.type}
                  </Badge>
                  {loc.is_primary && <Badge>Principal</Badge>}
                  {!loc.is_active && <Badge variant="outline">Inactif</Badge>}
                </div>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {loc.address}
                  {loc.city ? `, ${loc.city}` : ""}
                </p>
                {loc.phone_number && (
                  <p className="text-sm text-muted-foreground">{loc.phone_number}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(loc)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(loc.id)}>
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
            <DialogTitle>{editingId ? "Modifier le lieu" : "Nouveau lieu d'exercice"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom du lieu</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Cabinet Plateau"
              />
            </div>
            <div className="space-y-2">
              <Label>Type d'établissement</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="12 avenue Léopold Sédar Senghor"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ville</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Dakar"
                />
              </div>
              <div className="space-y-2">
                <Label>Code postal</Label>
                <Input
                  value={form.postal_code}
                  onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Téléphone du lieu</Label>
              <Input
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label>Lieu principal</Label>
                <p className="text-xs text-muted-foreground">Affiché par défaut aux patients</p>
              </div>
              <Switch
                checked={form.is_primary}
                onCheckedChange={(v) => setForm({ ...form, is_primary: v })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label>Actif</Label>
                <p className="text-xs text-muted-foreground">
                  Un lieu inactif n'est plus proposé à la réservation
                </p>
              </div>
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
