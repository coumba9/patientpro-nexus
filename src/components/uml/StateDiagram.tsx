
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";
import { DiagramExportButtons } from "./DiagramExportButtons";

const plantUMLCode = `@startuml JammSante_StateDiagram

title Diagramme d'États - Cycle de Vie des Rendez-vous (3 modes paiement)

[*] --> ChoixPaiement : Patient sélectionne créneau

state "Choix Mode Paiement" as ChoixPaiement {
  [*] --> SelectionMode
  SelectionMode --> PaiementEnLigne : En ligne (Wave/OM/Free/CB)
  SelectionMode --> PaiementSurPlace : Sur place au cabinet
  
  state "Paiement En Ligne" as PaiementEnLigne {
    [*] --> ProcessPaiement
    ProcessPaiement --> PaiementReussi : Succès
    ProcessPaiement --> PaiementEchoue : Échec
    PaiementEchoue --> ProcessPaiement : Réessayer
  }
  
  PaiementSurPlace --> [*] : payment_status=on_site
  PaiementEnLigne --> [*] : payment_status=paid
}

ChoixPaiement --> EnAttente : RDV créé
ChoixPaiement --> [*] : Abandon / Timeout

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
  SansExcuse --> PertePaiement : Paiement perdu (si payé en ligne)
  SansExcuse --> PenaliteAppliquee : Reprogrammation payante
  AvecExcuse --> ReprogrammationGratuite : Nouveau créneau offert
}

state "Annulé" as Annule {
  [*] --> VerificationDelai
  VerificationDelai --> RemboursementTotal : >24h avant (si payé en ligne)
  VerificationDelai --> RemboursementPartiel : <24h avant
  VerificationDelai --> PasRemboursement : Dernier moment
}

Termine --> [*]
Absent --> [*]
Annule --> [*]

note right of ChoixPaiement
  3 modes de paiement:
  1. En ligne: Wave, OM, Free, CB
  2. Sur place: au cabinet
end note

note right of Confirme
  SMS de confirmation envoyé
  Rappel programmé automatiquement
end note

@enduml`;

const mermaidCode = `stateDiagram-v2
  [*] --> ChoixPaiement: Sélection créneau
  
  state ChoixPaiement {
    [*] --> SelectionMode
    SelectionMode --> PaiementEnLigne: En ligne
    SelectionMode --> PaiementSurPlace: Sur place
    
    state PaiementEnLigne {
      [*] --> ProcessPaiement
      ProcessPaiement --> PaiementOK: Succès
      ProcessPaiement --> PaiementKO: Échec
      PaiementKO --> ProcessPaiement: Réessayer
    }
  }
  
  ChoixPaiement --> EnAttente: RDV créé
  ChoixPaiement --> [*]: Abandon
  
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
    VerifDelai --> RemboursTotal: >24h (si payé)
    VerifDelai --> RemboursPartiel: <24h
  }
  
  Termine --> [*]
  Absent --> [*]
  Annule --> [*]`;

export const StateDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Diagramme d'États - Rendez-vous</h2>
        <DiagramExportButtons
          plantUMLCode={plantUMLCode}
          mermaidCode={mermaidCode}
          diagramName="JammSante_StateDiagram"
        />
      </div>
      <p className="text-muted-foreground mb-4">
        Ce diagramme illustre le cycle de vie complet d'un rendez-vous avec les 3 modes de paiement,
        confirmation, rappels SMS, consultation, absences avec pénalités, et reprogrammation.
      </p>
      <div className="bg-muted/50 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {mermaidCode}
        </div>
      </div>
    </div>
  );
};
