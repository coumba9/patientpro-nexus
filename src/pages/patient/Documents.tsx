
import { useState } from "react";
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
  ClipboardList,
  History,
  Heart,
  BookOpen,
  Plus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientNotes } from "@/components/patient/PatientNotes";
import { AppointmentHistory } from "@/components/patient/AppointmentHistory";
import { HealthRecommendations } from "@/components/patient/HealthRecommendations";

interface Document {
  id: number;
  name: string;
  type: string;
  date: string;
  size: string;
  doctor: string;
}

const Documents = () => {
  const [documents] = useState<Document[]>([
    {
      id: 1,
      name: "Ordonnance - Traitement cardiaque",
      type: "Ordonnance",
      date: "2024-02-19",
      size: "245 KB",
      doctor: "Dr. Sarah Martin"
    },
    {
      id: 2,
      name: "Résultats analyse sanguine",
      type: "Analyse",
      date: "2024-02-15",
      size: "1.2 MB",
      doctor: "Dr. Thomas Bernard"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const handleDownload = (documentId: number) => {
    // Logique de téléchargement
  };

  const filteredDocuments = documents.filter(doc =>
    (doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.doctor.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (typeFilter === "all" || doc.type === typeFilter)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-8rem)]">
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
          <div className="p-6 border-b">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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

          <ScrollArea className="h-[calc(100%-8rem)] p-6">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun document trouvé</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <h3 className="font-semibold">{doc.name}</h3>
                          <p className="text-sm text-gray-500">{doc.doctor}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {doc.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Paperclip className="h-4 w-4" />
                              {doc.size}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
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
