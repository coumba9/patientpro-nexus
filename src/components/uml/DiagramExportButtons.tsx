import React from "react";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Image } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface DiagramExportButtonsProps {
  plantUMLCode: string;
  mermaidCode: string;
  diagramName: string;
}

const downloadFile = (content: string, filename: string, mimeType = "text/plain") => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// Generate Draw.io XML from mermaid code (simplified approach - wraps as text)
const generateDrawioXML = (mermaidCode: string, diagramName: string) => {
  const encoded = encodeURIComponent(mermaidCode);
  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" type="device">
  <diagram id="${diagramName}" name="${diagramName}">
    <mxGraphModel>
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="2" value="Ouvrir avec Mermaid dans Draw.io:&#xa;&#xa;1. Allez sur https://app.diagrams.net&#xa;2. Extras > Edit Diagram&#xa;3. Collez le code Mermaid ci-dessous" style="text;html=1;align=left;verticalAlign=top;whiteSpace=wrap;rounded=0;fontSize=14;" vertex="1" parent="1">
          <mxGeometry x="50" y="50" width="600" height="100" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
};

export const DiagramExportButtons = ({ plantUMLCode, mermaidCode, diagramName }: DiagramExportButtonsProps) => {
  
  const handlePlantUML = () => {
    downloadFile(plantUMLCode, `${diagramName}.puml`);
    toast.success("Fichier PlantUML téléchargé");
  };

  const handleMermaid = () => {
    downloadFile(mermaidCode, `${diagramName}.mmd`);
    toast.success("Fichier Mermaid téléchargé");
  };

  const openPlantUMLOnline = () => {
    // Copy to clipboard then open PlantUML editor
    navigator.clipboard.writeText(plantUMLCode).then(() => {
      toast.success("Code PlantUML copié dans le presse-papier ! Collez-le dans l'éditeur qui va s'ouvrir.");
      setTimeout(() => {
        window.open("https://www.plantuml.com/plantuml/uml/", "_blank");
      }, 500);
    }).catch(() => {
      // Fallback: download file instead
      downloadFile(plantUMLCode, `${diagramName}.puml`);
      toast.info("Fichier téléchargé. Ouvrez plantuml.com et importez le fichier.");
      window.open("https://www.plantuml.com/plantuml/uml/", "_blank");
    });
  };

  const openMermaidLive = () => {
    // Copy code to clipboard then open Mermaid Live
    navigator.clipboard.writeText(mermaidCode).then(() => {
      toast.success("Code Mermaid copié ! Collez-le dans l'éditeur qui va s'ouvrir.");
      setTimeout(() => {
        window.open("https://mermaid.live/edit", "_blank");
      }, 500);
    }).catch(() => {
      downloadFile(mermaidCode, `${diagramName}.mmd`);
      toast.info("Fichier téléchargé. Ouvrez mermaid.live et collez le contenu.");
      window.open("https://mermaid.live/edit", "_blank");
    });
  };

  const openDrawio = () => {
    navigator.clipboard.writeText(mermaidCode).then(() => {
      toast.success("Code copié ! Dans Draw.io: Extras > Edit Diagram > collez le code");
      setTimeout(() => {
        window.open("https://app.diagrams.net/", "_blank");
      }, 500);
    }).catch(() => {
      downloadFile(mermaidCode, `${diagramName}.mmd`);
      toast.info("Fichier téléchargé. Importez-le dans Draw.io");
      window.open("https://app.diagrams.net/", "_blank");
    });
  };

  const exportSVG = () => {
    const svgEl = document.querySelector(`[data-diagram="${diagramName}"] svg`) ||
      document.querySelector(".mermaid svg");
    if (svgEl) {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      downloadFile(svgData, `${diagramName}.svg`, "image/svg+xml");
      toast.success("SVG exporté avec succès");
    } else {
      toast.error("Impossible de trouver le diagramme SVG");
    }
  };

  const exportPNG = async () => {
    try {
      const { default: html2canvas } = await import("html2canvas");
      const containers = document.querySelectorAll<HTMLElement>(".bg-muted\\/50");
      let targetContainer: HTMLElement | null = null;
      containers.forEach(c => {
        if (c.querySelector(".mermaid") && !targetContainer) {
          targetContainer = c;
        }
      });
      
      if (!targetContainer) {
        toast.error("Diagramme introuvable");
        return;
      }

      const canvas = await html2canvas(targetContainer, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });
      
      const link = document.createElement("a");
      link.download = `${diagramName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("PNG exporté en haute résolution");
    } catch (err) {
      toast.error("Erreur lors de l'export PNG");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Télécharger le code source
        </div>
        <DropdownMenuItem onClick={handlePlantUML}>
          <Download className="h-4 w-4 mr-2" />
          PlantUML (.puml) — Gratuit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleMermaid}>
          <Download className="h-4 w-4 mr-2" />
          Mermaid (.mmd) — Gratuit
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Exporter en image
        </div>
        <DropdownMenuItem onClick={exportPNG}>
          <Image className="h-4 w-4 mr-2" />
          PNG haute résolution
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportSVG}>
          <Image className="h-4 w-4 mr-2" />
          SVG vectoriel
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Ouvrir dans un éditeur gratuit
        </div>
        <DropdownMenuItem onClick={openMermaidLive}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Mermaid Live Editor
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openPlantUMLOnline}>
          <ExternalLink className="h-4 w-4 mr-2" />
          PlantUML Online
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openDrawio}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Draw.io / diagrams.net
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
