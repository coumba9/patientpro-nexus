
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Upload,
  Download,
  Search,
  File,
  Filter,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Document {
  id: number;
  name: string;
  type: string;
  date: string;
  size: string;
  patient: string;
}

const Documents = () => {
  const [documents] = useState<Document[]>([
    {
      id: 1,
      name: "Ordonnance - Marie Dubois",
      type: "Ordonnance",
      date: "2024-02-20",
      size: "245 KB",
      patient: "Marie Dubois"
    },
    {
      id: 2,
      name: "Compte-rendu consultation",
      type: "Compte-rendu",
      date: "2024-02-19",
      size: "180 KB",
      patient: "Jean Martin"
    }
  ]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documents</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Rechercher un document..."
          />
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start gap-4">
                  <File className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">{doc.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{doc.date}</span>
                      <span>{doc.type}</span>
                      <span>{doc.size}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Patient: {doc.patient}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default Documents;
