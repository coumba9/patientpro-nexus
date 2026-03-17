import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  FileText,
  Download,
  Calendar,
  Paperclip,
  FolderOpen,
  History,
  Heart,
  BookOpen,
  Loader2,
  Eye,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { documentService } from "@/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientNotes } from "@/components/patient/PatientNotes";
import { AppointmentHistory } from "@/components/patient/AppointmentHistory";
import { HealthRecommendations } from "@/components/patient/HealthRecommendations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const isExternalFileUrl = (value: string) => /^(https?:\/\/|blob:|data:)/i.test(value);

const getFileExtension = (url: string): string | null => {
  const sanitizePath = (path: string) => {
    const filename = path.split('/').pop() ?? '';
    if (!filename.includes('.')) return null;
    return filename.split('.').pop()?.toLowerCase() ?? null;
  };

  try {
    return sanitizePath(new URL(url).pathname);
  } catch {
    const [cleanPath] = url.split('?');
    return sanitizePath(cleanPath);
  }
};

const imageExtensions = ['png', 'jpg', 'jpeg', 'webp', 'gif'];

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const docs = await documentService.getDocumentsByPatient(user.id);
        setDocuments(docs);
      } catch (error) {
        console.error("Erreur lors du chargement des documents:", error);
        toast.error("Erreur lors du chargement des documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user]);

  const handleDownload = (documentId: string) => {
    const doc = documents.find((d) => d.id === documentId);
    if (!doc?.file_url) {
      toast.error("Ce document n'a pas de fichier associé");
      return;
    }

    if (isExternalFileUrl(doc.file_url)) {
      window.open(doc.file_url, "_blank", "noopener,noreferrer");
      return;
    }

    const textBlob = new Blob([doc.file_url], { type: "text/plain;charset=utf-8" });
    const blobUrl = URL.createObjectURL(textBlob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = `${doc.title || "document"}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(blobUrl);
  };

  const handleView = (doc: any) => {
    setSelectedDoc(doc);
  };

  const filteredDocuments = documents.filter(doc =>
    (doc.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (typeFilter === "all" || doc.type === typeFilter)
  );

  return (
    <div className="bg-background rounded-lg shadow-sm h-[calc(100vh-8rem)]">
      <Tabs defaultValue="documents" className="h-full">
        <div className="p-6 border-b">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold">Mon Dossier Médical</h2>
          </div>
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Recommandations
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Notes
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="documents" className="h-[calc(100%-8rem)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="p-6 border-b">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      className="pl-10"
                      placeholder="Rechercher un document..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Type de document" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="Ordonnance">Ordonnances</SelectItem>
                      <SelectItem value="Analyse">Analyses</SelectItem>
                      <SelectItem value="Compte-rendu">Comptes-rendus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <ScrollArea className="h-[calc(100vh-22rem)] px-6">
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun document trouvé</p>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    {filteredDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <FileText className="h-5 w-5 text-primary" />
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">{doc.title}</h3>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                              </span>
                              {doc.file_size && (
                                <span className="flex items-center gap-1">
                                  <Paperclip className="h-3 w-3" />
                                  {(doc.file_size / 1024).toFixed(0)} KB
                                </span>
                              )}
                              <span>Type: {doc.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleView(doc)}
                            title="Visualiser"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(doc.id)}
                            title="Télécharger"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="p-6 h-[calc(100%-8rem)] overflow-auto">
          <AppointmentHistory />
        </TabsContent>

        <TabsContent value="recommendations" className="p-6 h-[calc(100%-8rem)] overflow-auto">
          <HealthRecommendations />
        </TabsContent>

        <TabsContent value="notes" className="p-6 h-[calc(100%-8rem)] overflow-auto">
          <PatientNotes />
        </TabsContent>
      </Tabs>

      {/* Document viewer dialog */}
      {selectedDoc && (
        <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedDoc.title}
              </DialogTitle>
              <DialogDescription>
                {selectedDoc.type} — {new Date(selectedDoc.created_at).toLocaleDateString('fr-FR')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedDoc.file_url ? (
                (() => {
                  const ext = selectedDoc.file_url.split('.').pop()?.toLowerCase();
                  if (ext === 'pdf') {
                    return (
                      <iframe
                        src={selectedDoc.file_url}
                        className="w-full h-[60vh] rounded border"
                        title={selectedDoc.title}
                      />
                    );
                  }
                  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext || '')) {
                    return (
                      <img
                        src={selectedDoc.file_url}
                        alt={selectedDoc.title}
                        className="w-full rounded border"
                      />
                    );
                  }
                  return (
                    <p className="text-muted-foreground text-center py-8">
                      Aperçu non disponible pour ce type de fichier.
                    </p>
                  );
                })()
              ) : (
                <div className="bg-muted p-6 rounded-lg text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Ce document n'a pas de fichier associé pour la visualisation.
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-left">
                    <p><span className="font-medium">Titre :</span> {selectedDoc.title}</p>
                    <p><span className="font-medium">Type :</span> {selectedDoc.type}</p>
                    <p><span className="font-medium">Date :</span> {new Date(selectedDoc.created_at).toLocaleDateString('fr-FR')}</p>
                    {selectedDoc.is_signed && <p><span className="font-medium">Statut :</span> Signé</p>}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setSelectedDoc(null)}>
                  Fermer
                </Button>
                {selectedDoc.file_url && (
                  <Button onClick={() => handleDownload(selectedDoc.id)}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Documents;
