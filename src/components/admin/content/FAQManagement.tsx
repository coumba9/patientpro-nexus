
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const mockFAQs = [
  {
    id: 1,
    question: "Comment prendre un rendez-vous ?",
    answer: "Vous pouvez prendre rendez-vous en ligne via notre plateforme...",
    category: "Rendez-vous",
    status: "published",
    order: 1
  },
  {
    id: 2,
    question: "Quels sont les modes de paiement acceptés ?",
    answer: "Nous acceptons les cartes bancaires, PayTech et les virements...",
    category: "Paiement",
    status: "published",
    order: 2
  },
  {
    id: 3,
    question: "Comment annuler un rendez-vous ?",
    answer: "Vous pouvez annuler votre rendez-vous depuis votre espace patient...",
    category: "Rendez-vous",
    status: "draft",
    order: 3
  },
];

export const FAQManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    return status === "published" ? "default" : "secondary";
  };

  const getStatusLabel = (status: string) => {
    return status === "published" ? "Publié" : "Brouillon";
  };

  const handleDelete = async (id: number) => {
    try {
      // TODO: Implement API call to delete FAQ
      // await faqService.delete(id);
      toast.success("Question FAQ supprimée avec succès");
    } catch (error) {
      toast.error("Erreur lors de la suppression de la question");
    }
  };

  const handleEdit = (id: number) => {
    // TODO: Implement edit dialog/form
    toast.info("Fonction d'édition en cours de développement");
  };

  const handleCreate = () => {
    // TODO: Implement create FAQ dialog/form
    toast.info("Fonction de création de FAQ en cours de développement");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Questions fréquentes
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle question
          </Button>
        </CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher une question..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockFAQs.map((faq) => (
            <Card key={faq.id} className="border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{faq.question}</h4>
                      <Badge variant="outline">{faq.category}</Badge>
                      <Badge variant={getStatusColor(faq.status)}>
                        {getStatusLabel(faq.status)}
                      </Badge>
                    </div>
                    
                    {expandedItems.includes(faq.id) && (
                      <p className="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpanded(faq.id)}
                    >
                      {expandedItems.includes(faq.id) ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(faq.id)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(faq.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
