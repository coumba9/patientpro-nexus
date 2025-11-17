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

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

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
    const doc = documents.find(d => d.id === documentId);
    if (doc?.file_url) {
      window.open(doc.file_url, '_blank');
    } else {
      toast.error("Ce document n'a pas de fichier associé");
    }
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
                        className="flex items-center justify-between p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors cursor-pointer"
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
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(doc.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
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
    </div>
  );
};

export default Documents;
