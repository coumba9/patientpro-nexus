
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  FileText,
  Upload,
  Download,
  Search,
  File,
  Filter,
  FileSignature,
  Share2,
  ArrowLeft,
  Home,
  Plus,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { SignaturePad } from "@/components/doctor/SignaturePad";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Document {
  id: number;
  name: string;
  type: string;
  date: string;
  size: string;
  patient: string;
  signed: boolean;
  content?: string;
}

const Documents = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      name: "Ordonnance - Marie Dubois",
      type: "Ordonnance",
      date: "2024-02-20",
      size: "245 KB",
      patient: "Marie Dubois",
      signed: false,
      content: "Paracétamol 1000mg - 3x par jour pendant 5 jours\nIbuprofène 400mg - 2x par jour pendant 3 jours"
    },
    {
      id: 2,
      name: "Compte-rendu consultation",
      type: "Compte-rendu",
      date: "2024-02-19",
      size: "180 KB",
      patient: "Jean Martin",
      signed: true
    },
    {
      id: 3,
      name: "Ordonnance - Sophie Lambert",
      type: "Ordonnance",
      date: "2024-02-22",
      size: "198 KB",
      patient: "Sophie Lambert",
      signed: false,
      content: "Amoxicilline 500mg - 2x par jour pendant 7 jours"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [addDocumentOpen, setAddDocumentOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: "",
    type: "Ordonnance",
    patient: "",
    content: ""
  });

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSignDocument = (document: Document) => {
    setSelectedDocument(document);
    setSignatureDialogOpen(true);
  };

  const saveSignature = (signatureData: string) => {
    if (!selectedDocument) return;
    
    setDocuments(docs => 
      docs.map(doc => 
        doc.id === selectedDocument.id 
          ? { ...doc, signed: true } 
          : doc
      )
    );
    
    setSignatureDialogOpen(false);
    setSelectedDocument(null);
    toast.success("Document signé avec succès");
  };

  const handleDownload = (document: Document) => {
    // Logique simulée de téléchargement
    console.log("Téléchargement du document:", document.name);
    
    // Création d'un blob pour simuler un téléchargement
    const blob = new Blob([document.content || "Contenu du document"], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = document.name + '.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${document.name} téléchargé`);
  };

  const handleShare = (document: Document) => {
    setSelectedDocument(document);
    setShareDialogOpen(true);
  };

  const confirmShare = () => {
    if (!selectedDocument) return;
    setShareDialogOpen(false);
    toast.success(`${selectedDocument.name} partagé`);
    setSelectedDocument(null);
  };

  const handleAddDocument = () => {
    // Vérifier si tous les champs sont remplis
    if (!newDocument.name || !newDocument.patient || !newDocument.content) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    // Créer un nouveau document
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    
    const newDoc: Document = {
      id: documents.length + 1,
      name: newDocument.name,
      type: newDocument.type,
      date: formattedDate,
      size: Math.floor(newDocument.content.length / 10) + " KB",
      patient: newDocument.patient,
      signed: false,
      content: newDocument.content
    };

    setDocuments([...documents, newDoc]);
    setAddDocumentOpen(false);
    
    // Réinitialiser le formulaire
    setNewDocument({
      name: "",
      type: "Ordonnance",
      patient: "",
      content: ""
    });
    
    toast.success("Document ajouté avec succès");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <div className="mb-4 flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <Link to="/">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Accueil
              </Button>
            </Link>
          </div>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Gérez vos ordonnances et documents médicaux</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
          <Dialog open={addDocumentOpen} onOpenChange={setAddDocumentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du document</Label>
                  <Input 
                    id="name" 
                    value={newDocument.name} 
                    onChange={(e) => setNewDocument({...newDocument, name: e.target.value})} 
                    placeholder="Ex: Ordonnance - Nom du patient"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type de document</Label>
                  <select 
                    id="type" 
                    className="w-full p-2 border rounded-md"
                    value={newDocument.type}
                    onChange={(e) => setNewDocument({...newDocument, type: e.target.value})}
                  >
                    <option value="Ordonnance">Ordonnance</option>
                    <option value="Compte-rendu">Compte-rendu</option>
                    <option value="Certificat">Certificat médical</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient">Nom du patient</Label>
                  <Input 
                    id="patient" 
                    value={newDocument.patient} 
                    onChange={(e) => setNewDocument({...newDocument, patient: e.target.value})} 
                    placeholder="Nom du patient"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Contenu</Label>
                  <Textarea 
                    id="content" 
                    value={newDocument.content} 
                    onChange={(e) => setNewDocument({...newDocument, content: e.target.value})} 
                    placeholder="Contenu du document"
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddDocument}>Ajouter le document</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Rechercher un document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start gap-4">
                    <File className="h-8 w-8 text-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{doc.name}</h3>
                        {doc.signed && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <FileSignature className="h-3 w-3 mr-1" />
                            Signé
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{doc.date}</span>
                        <span>{doc.type}</span>
                        <span>{doc.size}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Patient: {doc.patient}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {doc.type === "Ordonnance" && !doc.signed && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedDocument(doc)}>
                            <FileSignature className="h-4 w-4 mr-2" />
                            Signer
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Aperçu et signature du document</DialogTitle>
                          </DialogHeader>
                          <div className="bg-gray-50 p-4 rounded-md mb-4 whitespace-pre-line">
                            <h3 className="font-semibold mb-2">{doc.name}</h3>
                            <p className="text-sm text-gray-700">{doc.content}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            className="mb-4"
                            onClick={() => handleSignDocument(doc)}
                          >
                            <FileSignature className="h-4 w-4 mr-2" />
                            Signer cette ordonnance
                          </Button>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare(doc)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Partager
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun document ne correspond à votre recherche
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Dialog de signature */}
      <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Signer le document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              En tant que médecin, votre signature valide médicalement ce document pour le patient "{selectedDocument?.patient}".
            </p>
            <SignaturePad 
              onSave={saveSignature} 
              onCancel={() => setSignatureDialogOpen(false)} 
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de partage */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Partager le document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>Partager <strong>{selectedDocument?.name}</strong> avec :</p>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Adresse email du destinataire" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (optionnel)</Label>
              <Textarea id="message" placeholder="Message à inclure avec le document" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={confirmShare}>Envoyer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Documents;
