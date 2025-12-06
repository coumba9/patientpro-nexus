
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileJson } from "lucide-react";
import { downloadMDJFile } from "./StarUMLExporter";

export const MDJExportButton = () => {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileJson className="h-5 w-5 text-primary" />
            Export StarUML (.mdj)
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            Téléchargez tous les diagrammes en un seul fichier .mdj compatible avec StarUML
          </p>
        </div>
        <Button onClick={downloadMDJFile} className="gap-2">
          <Download className="h-4 w-4" />
          Télécharger JammSante_Complete.mdj
        </Button>
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        <p className="font-medium mb-2">Contenu du fichier MDJ :</p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 list-disc list-inside">
          <li>Diagramme de Classes (9 packages)</li>
          <li>Diagramme de Cas d'Utilisation</li>
          <li>Diagramme d'États (Rendez-vous)</li>
          <li>Diagramme d'Activité</li>
          <li>Diagrammes de Séquence (4 flux)</li>
          <li>Diagramme Entité-Relation (ERD)</li>
        </ul>
      </div>
    </div>
  );
};
