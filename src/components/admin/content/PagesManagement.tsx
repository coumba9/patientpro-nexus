
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

const mockPages = [
  {
    id: 1,
    title: "À propos",
    slug: "/about",
    status: "published",
    lastModified: "2024-06-08",
    author: "Admin"
  },
  {
    id: 2,
    title: "Nos valeurs",
    slug: "/values",
    status: "published",
    lastModified: "2024-06-07",
    author: "Admin"
  },
  {
    id: 3,
    title: "Contact",
    slug: "/contact",
    status: "draft",
    lastModified: "2024-06-09",
    author: "Admin"
  },
];

export const PagesManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "default";
      case "draft": return "secondary";
      case "archived": return "outline";
      default: return "outline";
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

  const handleDelete = (id: number) => {
    toast.success("Page supprimée avec succès");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Gestion des pages
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle page
          </Button>
        </CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher une page..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Titre</th>
                <th className="text-left p-4">URL</th>
                <th className="text-left p-4">Statut</th>
                <th className="text-left p-4">Dernière modification</th>
                <th className="text-left p-4">Auteur</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockPages.map((page) => (
                <tr key={page.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{page.title}</td>
                  <td className="p-4 text-sm text-gray-600">{page.slug}</td>
                  <td className="p-4">
                    <Badge variant={getStatusColor(page.status)}>
                      {getStatusLabel(page.status)}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm">{new Date(page.lastModified).toLocaleDateString()}</td>
                  <td className="p-4 text-sm">{page.author}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(page.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
