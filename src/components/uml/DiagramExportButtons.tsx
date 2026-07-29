import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Image, FileDown } from "lucide-react";

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
  const anchorRef = useRef<HTMLDivElement>(null);

  // Retrouve le conteneur du diagramme auquel appartient CE bouton
  const getSection = (): HTMLElement | null =>
    anchorRef.current?.closest<HTMLElement>("div.border-t") ?? null;

  const getDiagramContainer = (): HTMLElement | null =>
    getSection()?.querySelector<HTMLElement>(".bg-muted\\/50") ?? null;

  const captureCanvas = async (container: HTMLElement) => {
    const { default: html2canvas } = await import("html2canvas");
    const origMaxWidth = container.style.maxWidth;
    const origOverflow = container.style.overflow;
    container.style.maxWidth = "none";
    container.style.overflow = "visible";
    try {
      return await html2canvas(container, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
        windowWidth: Math.max(container.scrollWidth, 1600),
      });
    } finally {
      container.style.maxWidth = origMaxWidth;
      container.style.overflow = origOverflow;
    }
  };

  
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
    const svgEl = getSection()?.querySelector("svg");
    if (svgEl) {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      downloadFile(svgData, `${diagramName}.svg`, "image/svg+xml");
      toast.success("SVG exporté avec succès");
    } else {
      toast.error("Impossible de trouver le diagramme SVG");
    }
  };

  const exportPNG = async () => {
    const container = getDiagramContainer();
    if (!container) {
      toast.error("Diagramme introuvable");
      return;
    }
    try {
      const canvas = await captureCanvas(container);
      const link = document.createElement("a");
      link.download = `${diagramName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("PNG exporté en haute résolution");
    } catch {
      toast.error("Erreur lors de l'export PNG");
    }
  };

  const exportPDF = async () => {
    const section = getSection();
    const container = getDiagramContainer();
    if (!section || !container) {
      toast.error("Diagramme introuvable");
      return;
    }
    toast.info("Génération du PDF...");
    try {
      const [{ default: jsPDF }, canvas] = await Promise.all([
        import("jspdf"),
        captureCanvas(container),
      ]);

      const title = section.querySelector("h2")?.textContent || diagramName;
      const desc = section.querySelector("p.text-muted-foreground")?.textContent || "";

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 8;

      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, pageW, 16, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(title, margin, 11);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("JàmmSanté", pageW - margin, 11, { align: "right" });

      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      const descLines = doc.splitTextToSize(desc, pageW - margin * 2);
      doc.text(descLines, margin, 22);
      const descHeight = descLines.length * 4;

      const imgRatio = canvas.width / canvas.height;
      const availW = pageW - margin * 2;
      const startY = 20 + descHeight + 4;
      const availH = pageH - startY - margin;
      let drawW = availW;
      let drawH = drawW / imgRatio;
      if (drawH > availH) {
        drawH = availH;
        drawW = drawH * imgRatio;
      }
      doc.addImage(canvas.toDataURL("image/png", 1.0), "PNG", margin + (availW - drawW) / 2, startY, drawW, drawH);
      doc.save(`${diagramName}.pdf`);
      toast.success("PDF exporté avec succès");
    } catch {
      toast.error("Erreur lors de l'export PDF");
    }
  };

  return (
    <div ref={anchorRef}>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Exporter ce diagramme
        </div>
        <DropdownMenuItem onClick={exportPDF}>
          <FileDown className="h-4 w-4 mr-2" />
          PDF (A3 haute résolution)
        </DropdownMenuItem>

        <DropdownMenuSeparator />
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
