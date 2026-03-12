import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: string;
  sort_order: number;
}

export const FAQManagement = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", category: "Général", status: "draft" });

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("faqs" as any)
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setFaqs((data as any[]) || []);
    } catch (e) {
      console.error("Error fetching FAQs:", e);
      toast.error("Erreur lors du chargement des FAQ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFaqs(); }, []);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const getStatusColor = (status: string) => (status === "published" ? "default" : "secondary") as "default" | "secondary";
  const getStatusLabel = (status: string) => (status === "published" ? "Publié" : "Brouillon");

  const openCreate = () => {
    setEditingFaq(null);
    setForm({ question: "", answer: "", category: "Général", status: "draft" });
    setDialogOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category, status: faq.status });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error("La question et la réponse sont obligatoires");
      return;
    }
    try {
      if (editingFaq) {
        const { error } = await supabase
          .from("faqs" as any)
          .update({ question: form.question, answer: form.answer, category: form.category, status: form.status } as any)
          .eq("id", editingFaq.id);
        if (error) throw error;
        toast.success("FAQ mise à jour");
      } else {
        const maxOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => f.sort_order)) + 1 : 1;
        const { error } = await supabase
          .from("faqs" as any)
          .insert({ question: form.question, answer: form.answer, category: form.category, status: form.status, sort_order: maxOrder } as any);
        if (error) throw error;
        toast.success("FAQ créée");
      }
      setDialogOpen(false);
      fetchFaqs();
    } catch (e) {
      console.error("Error saving FAQ:", e);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("faqs" as any).delete().eq("id", id);
      if (error) throw error;
      toast.success("FAQ supprimée");
      fetchFaqs();
    } catch (e) {
      console.error("Error deleting FAQ:", e);
      toast.error("Erreur lors de la suppression");
    }
  };

  const filtered = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Questions fréquentes
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle question
            </Button>
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher une question..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune FAQ trouvée</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((faq) => (
                <Card key={faq.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-medium">{faq.question}</h4>
                          <Badge variant="outline">{faq.category}</Badge>
                          <Badge variant={getStatusColor(faq.status)}>{getStatusLabel(faq.status)}</Badge>
                        </div>
                        {expandedItems.includes(faq.id) && (
                          <p className="text-sm text-muted-foreground mt-2 p-3 bg-muted rounded">{faq.answer}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button size="sm" variant="ghost" onClick={() => toggleExpanded(faq.id)}>
                          {expandedItems.includes(faq.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEdit(faq)}><Edit className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(faq.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingFaq ? "Modifier la FAQ" : "Nouvelle FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="La question..." />
            </div>
            <div className="space-y-2">
              <Label>Réponse</Label>
              <Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="La réponse..." rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>{editingFaq ? "Mettre à jour" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
