
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";

export const UseCaseDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <h2 className="text-2xl font-bold mb-4">Diagramme de Cas d'Utilisation</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Ce diagramme illustre les principaux cas d'utilisation pour les différents acteurs du système MediConnect.
      </p>
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            flowchart LR
              %% Acteurs principaux
              Patient["👤<br/>Patient"]
              Medecin["👨‍⚕️<br/>Médecin"]
              Admin["👑<br/>Administrateur"]
              
              %% Groupes de cas d'utilisation
              subgraph "Gestion des Rendez-vous"
                UC1["Rechercher médecin"]
                UC2["Prendre RDV"]
                UC3["Consulter tickets"]
                UC4["Annuler/Reprogrammer"]
              end
              
              subgraph "Consultation Médicale"
                UC5["Téléconsultation"]
                UC6["Dossier médical"]
                UC7["Ordonnances"]
                UC8["Documents médicaux"]
              end
              
              subgraph "Gestion Financière"
                UC9["Payer consultation"]
                UC10["Gérer tarifs"]
                UC11["Transactions"]
              end
              
              subgraph "Administration"
                UC12["Gérer utilisateurs"]
                UC13["Modérer contenu"]
                UC14["Analytics"]
                UC15["File d'attente"]
              end
              
              subgraph "Communication"
                UC16["Notifications"]
                UC17["Messages"]
                UC18["Rappels"]
              end
              
              %% Relations Patient
              Patient --> UC1
              Patient --> UC2
              Patient --> UC3
              Patient --> UC4
              Patient --> UC5
              Patient --> UC6
              Patient --> UC9
              Patient --> UC16
              Patient --> UC17
              
              %% Relations Médecin
              Medecin --> UC5
              Medecin --> UC6
              Medecin --> UC7
              Medecin --> UC8
              Medecin --> UC10
              Medecin --> UC16
              Medecin --> UC17
              
              %% Relations Admin
              Admin --> UC11
              Admin --> UC12
              Admin --> UC13
              Admin --> UC14
              Admin --> UC15
              Admin --> UC18
              
              %% Styling
              classDef actorStyle fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#000
              classDef usecaseStyle fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,color:#000
              classDef groupStyle fill:#fff3e0,stroke:#ff9800,stroke-width:2px
              
              class Patient,Medecin,Admin actorStyle
              class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9,UC10,UC11,UC12,UC13,UC14,UC15,UC16,UC17,UC18 usecaseStyle
          `}
        </div>
      </div>
    </div>
  );
};
