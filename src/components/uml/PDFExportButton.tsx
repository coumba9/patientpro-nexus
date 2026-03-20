import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const PDFExportButton = () => {
  const [exporting, setExporting] = useState(false);

  const exportAllDiagramsToPDF = async () => {
    setExporting(true);
    toast.info("Génération du PDF en cours...");

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 8;

      // Cover page
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, pageW, pageH, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(42);
      doc.setFont("helvetica", "bold");
      doc.text("JàmmSanté", pageW / 2, pageH / 2 - 25, { align: "center" });
      doc.setFontSize(22);
      doc.text("Diagrammes UML — Documentation Technique", pageW / 2, pageH / 2 + 5, { align: "center" });
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text(new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }), pageW / 2, pageH / 2 + 25, { align: "center" });

      // Find all diagram sections
      const sections = document.querySelectorAll<HTMLElement>(".space-y-12 > div.border-t");
      const totalSections = sections.length;
      
      toast.info(`Capture de ${totalSections} diagrammes en haute résolution...`);

      for (let i = 0; i < totalSections; i++) {
        const section = sections[i];
        doc.addPage();

        // Get title
        const titleEl = section.querySelector("h2");
        const title = titleEl?.textContent || `Diagramme ${i + 1}`;
        
        // Get description
        const descEl = section.querySelector("p.text-muted-foreground");
        const desc = descEl?.textContent || "";

        toast.info(`Capture ${i + 1}/${totalSections}: ${title}`);

        // Header bar
        doc.setFillColor(34, 197, 94);
        doc.rect(0, 0, pageW, 16, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin, 11);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`JàmmSanté — ${i + 1}/${totalSections}`, pageW - margin, 11, { align: "right" });

        // Description below header
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(9);
        const descLines = doc.splitTextToSize(desc, pageW - margin * 2);
        doc.text(descLines, margin, 22);
        const descHeight = descLines.length * 4;

        // Capture the mermaid diagram container at high resolution
        const diagramContainer = section.querySelector<HTMLElement>(".bg-muted\\/50");
        if (!diagramContainer) continue;

        // Temporarily expand the container for better capture
        const origMaxWidth = diagramContainer.style.maxWidth;
        const origOverflow = diagramContainer.style.overflow;
        diagramContainer.style.maxWidth = "none";
        diagramContainer.style.overflow = "visible";

        const canvas = await html2canvas(diagramContainer, {
          scale: 3, // Much higher resolution
          backgroundColor: "#ffffff",
          logging: false,
          useCORS: true,
          allowTaint: true,
          removeContainer: true,
          windowWidth: Math.max(diagramContainer.scrollWidth, 1600),
        });

        // Restore styles
        diagramContainer.style.maxWidth = origMaxWidth;
        diagramContainer.style.overflow = origOverflow;

        const imgData = canvas.toDataURL("image/png", 1.0);
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

        const x = margin + (availW - drawW) / 2;
        doc.addImage(imgData, "PNG", x, startY, drawW, drawH);
      }

      doc.save("JammSante_Diagrammes_UML.pdf");
      toast.success("PDF exporté avec succès en haute résolution !");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Erreur lors de l'export PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      onClick={exportAllDiagramsToPDF}
      disabled={exporting}
      variant="outline"
      className="gap-2"
    >
      {exporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {exporting ? "Export en cours..." : "Exporter tous les diagrammes en PDF (A3 HD)"}
    </Button>
  );
};
