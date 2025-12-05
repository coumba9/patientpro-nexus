
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// PlantUML export for StarUML compatibility
const plantUMLCode = `@startuml JammSante_StateDiagram

title Diagramme d'États - Cycle de Vie des Rendez-vous

[*] --> EnAttentePaiement : Patient sélectionne créneau

state "En Attente Paiement" as EnAttentePaiement {
  [*] --> SelectionMethode
  SelectionMethode --> ProcessPaiement : Initie paiement
  ProcessPaiement --> PaiementReussi : Succès
  ProcessPaiement --> PaiementEchoue : Échec
  PaiementEchoue --> SelectionMethode : Réessayer
}

EnAttentePaiement --> EnAttente : Paiement confirmé
EnAttentePaiement --> [*] : Abandon / Timeout

state "En Attente" as EnAttente {
  [*] --> AttenteConfirmation
  AttenteConfirmation : Médecin doit confirmer
  AttenteConfirmation --> RappelProgramme : Trigger DB
  RappelProgramme : SMS rappel 24h avant programmé
}

EnAttente --> Confirme : Médecin confirme
EnAttente --> Annule : Patient/Médecin annule

state "Confirmé" as Confirme {
  [*] --> AttenteConsultation
  AttenteConsultation --> RappelEnvoye : 24h avant
  RappelEnvoye : SMS envoyé au patient
  RappelEnvoye --> PretPourConsultation
}

Confirme --> EnConsultation : Jour J - Médecin démarre
Confirme --> Annule : Annulation
Confirme --> Reprogramme : Demande reprogrammation

state "Reprogrammé" as Reprogramme {
  [*] --> VerificationPolitique
  VerificationPolitique --> SansPenalite : >24h avant
  VerificationPolitique --> AvecPenalite : <24h avant
  AvecPenalite --> PaiementPenalite : Frais applicables
  PaiementPenalite --> NouveauCreneau
  SansPenalite --> NouveauCreneau
  NouveauCreneau --> [*]
}

Reprogramme --> EnAttente : Nouveau créneau choisi

state "En Consultation" as EnConsultation {
  [*] --> ConsultationEnCours
  ConsultationEnCours : Patient présent
  ConsultationEnCours --> CreationDossier : Médecin rédige
  CreationDossier --> SignatureDocuments : Ordonnance/Documents
}

EnConsultation --> Termine : Consultation terminée
EnConsultation --> Absent : Patient ne se présente pas

state "Terminé" as Termine {
  [*] --> DossierMedicalCree
  DossierMedicalCree --> OrdonnanceDisponible
  OrdonnanceDisponible --> FactureGeneree
  FactureGeneree --> NotationPossible
  NotationPossible : Patient peut noter médecin
}

state "Absent (No-Show)" as Absent {
  [*] --> VerificationPolitiqueAbsence
  VerificationPolitiqueAbsence --> AvecExcuse : Excuse valide
  VerificationPolitiqueAbsence --> SansExcuse : Pas d'excuse
  SansExcuse --> PertePaiement : Paiement perdu
  SansExcuse --> PenaliteAppliquee : Reprogrammation payante
  AvecExcuse --> ReprogrammationGratuite : Nouveau créneau offert
}

state "Annulé" as Annule {
  [*] --> VerificationDelai
  VerificationDelai --> RemboursementTotal : >24h avant
  VerificationDelai --> RemboursementPartiel : <24h avant
  VerificationDelai --> PasRemboursement : Dernier moment
}

Termine --> [*]
Absent --> [*]
Annule --> [*]

note right of EnAttentePaiement
  Méthodes: Wave, Orange Money,
  Free Money, Carte Bancaire
end note

note right of Confirme
  SMS de confirmation envoyé
  Rappel programmé automatiquement
end note

note left of Absent
  Politique configurable par admin:
  - Délai d'excuse
  - Pourcentage pénalité
  - Max reprogrammations
end note

@enduml`;

const downloadPlantUML = () => {
  const blob = new Blob([plantUMLCode], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'JammSante_StateDiagram.puml';
  a.click();
  URL.revokeObjectURL(url);
};

export const StateDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Diagramme d'États - Rendez-vous</h2>
        <Button variant="outline" size="sm" onClick={downloadPlantUML}>
          <Download className="h-4 w-4 mr-2" />
          Export PlantUML (StarUML)
        </Button>
      </div>
      <p className="text-muted-foreground mb-4">
        Ce diagramme illustre le cycle de vie complet d'un rendez-vous, incluant paiement, confirmation, 
        rappels SMS, consultation, absences avec pénalités, et reprogrammation.
      </p>
      <div className="bg-muted/50 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            stateDiagram-v2
              [*] --> EnAttentePaiement: Sélection créneau
              
              state EnAttentePaiement {
                [*] --> SelectionMethode
                SelectionMethode --> ProcessPaiement: Initie
                ProcessPaiement --> PaiementOK: Succès
                ProcessPaiement --> PaiementKO: Échec
                PaiementKO --> SelectionMethode: Réessayer
              }
              
              EnAttentePaiement --> EnAttente: Paiement confirmé
              EnAttentePaiement --> [*]: Abandon
              
              state EnAttente {
                [*] --> AttenteConfirmation
                AttenteConfirmation --> RappelProgramme: Auto
              }
              
              EnAttente --> Confirme: Médecin confirme + SMS
              EnAttente --> Annule: Annulation
              
              state Confirme {
                [*] --> AttenteRDV
                AttenteRDV --> RappelEnvoye: 24h avant
                RappelEnvoye --> PretConsultation
              }
              
              Confirme --> EnConsultation: Jour J
              Confirme --> Annule: Annulation
              Confirme --> Reprogramme: Report
              
              state Reprogramme {
                [*] --> VerifPolitique
                VerifPolitique --> SansPenalite: >24h
                VerifPolitique --> AvecPenalite: <24h
                AvecPenalite --> PaiementFrais
              }
              
              Reprogramme --> EnAttente: Nouveau créneau
              
              state EnConsultation {
                [*] --> ConsultationCours
                ConsultationCours --> CreationDossier
                CreationDossier --> Signature
              }
              
              EnConsultation --> Termine: Terminé
              EnConsultation --> Absent: No-show
              
              state Termine {
                [*] --> DossierCree
                DossierCree --> OrdonnanceDispo
                OrdonnanceDispo --> FactureGeneree
                FactureGeneree --> NotationPossible
              }
              
              state Absent {
                [*] --> VerifExcuse
                VerifExcuse --> AvecExcuse: Excuse valide
                VerifExcuse --> SansExcuse: Non justifié
                SansExcuse --> PertePaiement
                AvecExcuse --> ReprogGratuite
              }
              
              state Annule {
                [*] --> VerifDelai
                VerifDelai --> RemboursTotal: >24h
                VerifDelai --> RemboursPartiel: <24h
              }
              
              Termine --> [*]
              Absent --> [*]
              Annule --> [*]
          `}
        </div>
      </div>
    </div>
  );
};
