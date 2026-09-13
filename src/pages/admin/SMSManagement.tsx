import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { SMSLog } from "@/api/services/sms.service";

const PAGE_SIZE = 25;
const statuses: Record<string, string> = { sent: "Envoyé", failed: "Échec", provider_down: "Prestataire indisponible", pending: "En attente", delivered: "Livré" };
const dateLabel = (value: string | null) => value ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "medium", timeZone: "Africa/Dakar" }).format(new Date(value)) : "—";
const kind = (message: string) => /rappel/i.test(message) ? "Rappel" : /confirm/i.test(message) ? "Confirmation" : "Autre";

export default function SMSManagement() {
  const { userRole } = useAuth();
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<SMSLog | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => { setTerm(search); setPage(0); }, 200);
    return () => clearTimeout(timer);
  }, [search]);
  const invalidDates = Boolean(from && to && from > to);
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["admin-sms", term, status, type, from, to, page],
    enabled: userRole === "admin" && !invalidDates,
    queryFn: async () => {
      let query = supabase.from("sms_logs").select("*", { count: "exact" });
      if (status !== "all") query = query.eq("status", status);
      if (type !== "all") query = query.ilike("message", type === "reminder" ? "%rappel%" : "%confirm%");
      if (from) query = query.gte("created_at", `${from}T00:00:00Z`);
      if (to) {
        const next = new Date(`${to}T00:00:00Z`);
        next.setUTCDate(next.getUTCDate() + 1);
        query = query.lt("created_at", next.toISOString());
      }
      const safe = term.replace(/[^\p{L}\p{N}\s]/gu, "").trim();
      if (safe) {
        const phone = safe.replace(/\s/g, "");
        query = query.or(`phone_number.ilike.%${phone}%,message.ilike.%${safe}%`);
      }
      const { data: rows, count, error } = await query.order("created_at", { ascending: false }).order("id").range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (error) throw error;
      return { rows: rows as SMSLog[], count: count ?? 0 };
    },
  });
  const filter = (setter: (value: string) => void) => (value: string) => { setter(value); setPage(0); };
  if (userRole !== "admin") return null;
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden lg:block shrink-0"><AdminSidebar /></aside>
      <main className="min-w-0 flex-1 p-4 md:p-8 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-3xl font-bold">Historique SMS</h1><p className="text-sm text-muted-foreground">Dates et heures de Dakar · {data?.count ?? "—"} résultat(s)</p></div>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching || invalidDates}><RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />Actualiser</Button>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2"><Label htmlFor="sms-search">Numéro ou message</Label><Input id="sms-search" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div className="space-y-2"><Label>Statut</Label><Select value={status} onValueChange={filter(setStatus)}><SelectTrigger aria-label="Statut"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les statuts</SelectItem>{Object.entries(statuses).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Type</Label><Select value={type} onValueChange={filter(setType)}><SelectTrigger aria-label="Type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les SMS</SelectItem><SelectItem value="reminder">Rappels</SelectItem><SelectItem value="confirmation">Confirmations</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="sms-from">Du</Label><Input id="sms-from" type="date" value={from} onChange={e => filter(setFrom)(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="sms-to">Au</Label><Input id="sms-to" type="date" value={to} onChange={e => filter(setTo)(e.target.value)} /></div>
        </div>
        <p className="text-sm text-muted-foreground">« Envoyé » indique l’acceptation par le prestataire, pas la réception sur le téléphone.</p>
        {invalidDates ? <p role="alert" className="text-destructive">La date de fin doit être postérieure ou égale à la date de début.</p> : isError ? <div role="alert" className="text-destructive">Impossible de charger l’historique. <Button variant="outline" onClick={() => refetch()}>Réessayer</Button></div> : isLoading ? <p role="status">Chargement des SMS…</p> : !data?.rows.length ? <p className="py-12 text-center text-muted-foreground">Aucun SMS pour ces critères.</p> : <>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left"><thead className="bg-muted"><tr>{["Date (Dakar)", "Numéro", "Type", "Statut", "Message", ""].map((label, i) => <th key={i} className="p-3 font-medium">{label}</th>)}</tr></thead>
              <tbody>{data.rows.map(log => <tr key={log.id} className="border-t border-border">
                <td className="p-3 whitespace-nowrap">{dateLabel(log.created_at)}</td><td className="p-3 whitespace-nowrap">{log.phone_number.startsWith("+") ? "" : "+"}{log.phone_number}</td><td className="p-3">{kind(log.message)}</td>
                <td className="p-3"><Badge variant={log.status === "failed" || log.status === "provider_down" ? "destructive" : "secondary"}>{statuses[log.status] ?? log.status}</Badge></td>
                <td className="p-3 min-w-48 max-w-sm"><p className="line-clamp-2 break-words">{log.message}</p></td>
                <td className="p-3"><Button variant="outline" size="sm" onClick={() => setSelected(log)}>Détails</Button></td>
              </tr>)}</tbody>
            </table>
          </div>
          <div className="flex items-center justify-end gap-3"><Button variant="outline" size="icon" aria-label="Page précédente" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button><span className="text-sm">Page {page + 1} / {Math.max(1, Math.ceil(data.count / PAGE_SIZE))}</span><Button variant="outline" size="icon" aria-label="Page suivante" disabled={(page + 1) * PAGE_SIZE >= data.count} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button></div>
        </>}
        <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>Détails du SMS</DialogTitle></DialogHeader>{selected && <div className="space-y-4 text-sm break-words">
          <dl className="grid grid-cols-2 gap-2"><dt>Numéro</dt><dd>{selected.phone_number}</dd><dt>Statut</dt><dd>{statuses[selected.status] ?? selected.status}</dd><dt>Tentative (Dakar)</dt><dd>{dateLabel(selected.created_at)}</dd><dt>Envoi (Dakar)</dt><dd>{dateLabel(selected.sent_at)}</dd></dl>
          <div><h2 className="font-semibold mb-2">Message</h2><p className="whitespace-pre-wrap">{selected.message}</p></div>
          <div><h2 className="font-semibold mb-2">Réponse du prestataire / erreur</h2><pre className="whitespace-pre-wrap break-all bg-muted rounded-md p-3 text-xs">{selected.provider_response ? JSON.stringify(selected.provider_response, null, 2) : "Aucune réponse enregistrée."}</pre></div>
        </div>}</DialogContent></Dialog>
      </main>
    </div>
  );
}