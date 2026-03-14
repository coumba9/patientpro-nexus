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

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 10;

      // Cover page
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, pageW, pageH, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(36);
      doc.setFont("helvetica", "bold");
      doc.text("JàmmSanté", pageW / 2, pageH / 2 - 20, { align: "center" });
      doc.setFontSize(20);
      doc.text("Diagrammes UML — Documentation Technique", pageW / 2, pageH / 2 + 5, { align: "center" });
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }), pageW / 2, pageH / 2 + 20, { align: "center" });

      // Find all diagram sections (each has border-t class)
      const sections = document.querySelectorAll<HTMLElement>(".space-y-12 > div.border-t");
      const totalSections = sections.length;
      
      toast.info(`Capture de ${totalSections} diagrammes...`);

      for (let i = 0; i < totalSections; i++) {
        const section = sections[i];
        doc.addPage();

        // Get title
        const titleEl = section.querySelector("h2");
        const title = titleEl?.textContent || `Diagramme ${i + 1}`;
        
        toast.info(`Capture ${i + 1}/${totalSections}: ${title}`);

        // Header bar
        doc.setFillColor(34, 197, 94);
        doc.rect(0, 0, pageW, 14, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin, 10);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(`JàmmSanté — ${i + 1}/${totalSections}`, pageW - margin, 10, { align: "right" });

        // Capture the mermaid diagram container
        const diagramContainer = section.querySelector<HTMLElement>(".bg-muted\\/50");
        if (!diagramContainer) continue;

        const canvas = await html2canvas(diagramContainer, {
          scale: 1.5,
          backgroundColor: "#ffffff",
          logging: false,
          useCORS: true,
          allowTaint: true,
          removeContainer: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgRatio = canvas.width / canvas.height;
        const availW = pageW - margin * 2;
        const availH = pageH - 20 - margin;
        let drawW = availW;
        let drawH = drawW / imgRatio;

        if (drawH > availH) {
          drawH = availH;
          drawW = drawH * imgRatio;
        }

        const x = margin + (availW - drawW) / 2;
        doc.addImage(imgData, "PNG", x, 18, drawW, drawH);
      }

      doc.save("JammSante_Diagrammes_UML.pdf");
      toast.success("PDF exporté avec succès !");
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
      {exporting ? "Export en cours..." : "Exporter tous les diagrammes en PDF"}
    </Button>
  );
};
