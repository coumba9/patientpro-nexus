import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  updated_at: string;
}

export const PagesManagement = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", content: "", status: "draft" });

  const fetchPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pages" as any)
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      setPages((data as any[]) || []);
    } catch (e) {
      console.error("Error fetching pages:", e);
      toast.error("Erreur lors du chargement des pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "default" as const;
      case "draft": return "secondary" as const;
      case "archived": return "outline" as const;
      default: return "outline" as const;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "published": return "Publié";
      case "draft": return "Brouillon";
      case "archived": return "Archivé";
      default: return status;
    }
  };

  const openCreate = () => {
    setEditingPage(null);
    setForm({ title: "", slug: "", content: "", status: "draft" });
    setDialogOpen(true);
  };

  const openEdit = (page: Page) => {
    setEditingPage(page);
    setForm({ title: page.title, slug: page.slug, content: page.content || "", status: page.status });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Le titre et le slug sont obligatoires");
      return;
    }
    try {
      if (editingPage) {
        const { error } = await supabase
          .from("pages" as any)
          .update({ title: form.title, slug: form.slug, content: form.content, status: form.status } as any)
          .eq("id", editingPage.id);
        if (error) throw error;
        toast.success("Page mise à jour");
      } else {
        const { error } = await supabase
          .from("pages" as any)
          .insert({ title: form.title, slug: form.slug, content: form.content, status: form.status } as any);
        if (error) throw error;
        toast.success("Page créée");
      }
      setDialogOpen(false);
      fetchPages();
    } catch (e) {
      console.error("Error saving page:", e);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("pages" as any).delete().eq("id", id);
      if (error) throw error;
      toast.success("Page supprimée");
      fetchPages();
    } catch (e) {
      console.error("Error deleting page:", e);
      toast.error("Erreur lors de la suppression");
    }
  };

  const filtered = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Gestion des pages
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle page
            </Button>
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher une page..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Titre</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">URL</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Statut</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Dernière modification</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Aucune page trouvée</td></tr>
                  ) : (
                    filtered.map((page) => (
                      <tr key={page.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                        <td className="p-4 font-medium">{page.title}</td>
                        <td className="p-4 text-sm text-muted-foreground">{page.slug}</td>
                        <td className="p-4">
                          <Badge variant={getStatusColor(page.status)}>{getStatusLabel(page.status)}</Badge>
                        </td>
                        <td className="p-4 text-sm">{new Date(page.updated_at).toLocaleDateString("fr-FR")}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <a href={page.slug} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline"><Eye className="h-3 w-3" /></Button>
                            </a>
                            <Button size="sm" variant="outline" onClick={() => openEdit(page)}><Edit className="h-3 w-3" /></Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(page.id)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingPage ? "Modifier la page" : "Nouvelle page"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre de la page" />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="/mon-slug" />
            </div>
            <div className="space-y-2">
              <Label>Contenu</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Contenu de la page..." rows={6} />
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>{editingPage ? "Mettre à jour" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
