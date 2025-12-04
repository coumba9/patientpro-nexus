
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// PlantUML export for StarUML compatibility
const plantUMLCode = `@startuml JammSante_ClassDiagram

skinparam classAttributeIconSize 0
skinparam classFontStyle bold

package "Utilisateurs" {
  abstract class Utilisateur {
    +id: UUID
    +nom: String
    +prenom: String
    +email: String
    +telephone: String
    +adresse: String
    +avatarUrl: String
    +role: AppRole
    +authentifier()
    +gererProfil()
  }

  class Patient {
    +dateNaissance: Date
    +sexe: String
    +groupeSanguin: String
    +allergies: String[]
    +antecedentsMedicaux: JSON
    +beneficiaires: JSON
    +estActif: Boolean
    +prendreRendezVous()
    +consulterDossierMedical()
    +payerConsultation()
    +recevoirRappels()
    +annulerRendezVous()
    +reprogrammerRendezVous()
    +noterMedecin()
    +accederOrdonnances()
    +telechargerFacture()
  }

  class Medecin {
    +specialiteId: UUID
    +numeroLicence: String
    +anneesExperience: Number
    +estVerifie: Boolean
    +adresse: String
    +latitude: Decimal
    +longitude: Decimal
    +gererRendezVous()
    +creerOrdonnance()
    +teleconsultation()
    +gererDocuments()
    +signerDocuments()
    +accederDossierPatient()
    +consulterAnalytics()
    +confirmerRendezVous()
  }

  class Administrateur {
    +gererUtilisateurs()
    +modererContenu()
    +consulterAnalytics()
    +gererPaiements()
    +gererNotifications()
    +gererSpecialites()
    +approuverMedecins()
    +gererFileAttente()
    +gererRappels()
    +configurerPolitiques()
  }
}

package "Rendez-vous" {
  class RendezVous {
    +id: UUID
    +medecinId: UUID
    +patientId: UUID
    +date: Date
    +heure: Time
    +type: String
    +mode: String
    +statut: String
    +lieu: String
    +notes: JSON
    +montantPaiement: Decimal
    +statutPaiement: String
    +paiementId: String
    +annuleLe: DateTime
    +annulePar: UUID
    +raisonAnnulation: String
    +datePrecedente: Date
    +heurePrecedente: Time
    +raisonReprogrammation: String
    +nombreReprogrammations: Number
    +reprogrammer()
    +annuler()
    +confirmer()
    +terminer()
    +marquerAbsent()
  }

  class DemandeApplicationMedecin {
    +id: UUID
    +email: String
    +prenom: String
    +nom: String
    +specialiteId: UUID
    +numeroLicence: String
    +anneesExperience: Number
    +urlDiplome: String
    +urlLicence: String
    +autresDocuments: String[]
    +statut: String
    +raisonRejet: String
    +reviewedBy: UUID
    +reviewedAt: DateTime
    +approuver()
    +rejeter()
  }
}

package "Médical" {
  class DossierMedical {
    +id: UUID
    +patientId: UUID
    +medecinId: UUID
    +diagnostic: String
    +prescription: String
    +notes: String
    +date: Date
    +consulter()
    +modifier()
  }

  class Document {
    +id: UUID
    +patientId: UUID
    +medecinId: UUID
    +titre: String
    +type: String
    +urlFichier: String
    +tailleFichier: Number
    +estSigne: Boolean
    +signeLe: DateTime
    +creer()
    +signer()
    +telecharger()
  }

  class ResultatLabo {
    +id: UUID
    +patientId: UUID
    +medecinId: UUID
    +nomTest: String
    +dateTest: Date
    +resultats: String
    +urlFichier: String
    +notes: String
  }

  class ImageMedicale {
    +id: UUID
    +patientId: UUID
    +medecinId: UUID
    +typeImage: String
    +urlImage: String
    +dateImage: Date
    +description: String
    +notes: String
  }

  class Vaccination {
    +id: UUID
    +patientId: UUID
    +nomVaccin: String
    +dateVaccination: Date
    +prochaineDose: Date
    +administrePar: String
    +notes: String
  }
}

package "Paiements" {
  class Facture {
    +id: UUID
    +rendezVousId: UUID
    +patientId: UUID
    +medecinId: UUID
    +montant: Decimal
    +statutPaiement: String
    +methodePaiement: String
    +datePaiement: DateTime
    +numeroFacture: String
    +genererPDF()
    +envoyer()
  }

  class Evaluation {
    +id: UUID
    +patientId: UUID
    +medecinId: UUID
    +rendezVousId: UUID
    +note: Number
    +commentaire: String
    +creer()
    +modifier()
  }
}

package "Notifications" {
  class Notification {
    +id: UUID
    +utilisateurId: UUID
    +rendezVousId: UUID
    +type: String
    +titre: String
    +message: String
    +priorite: String
    +estLue: Boolean
    +metadata: JSON
    +marquerCommeLue()
    +envoyer()
  }

  class Rappel {
    +id: UUID
    +rendezVousId: UUID
    +patientId: UUID
    +programmePour: DateTime
    +typeRappel: String
    +methode: String
    +tentatives: Number
    +statut: String
    +programmer()
    +executer()
    +annuler()
  }

  class LogSMS {
    +id: UUID
    +utilisateurId: UUID
    +numeroTelephone: String
    +message: String
    +statut: String
    +reponseFournisseur: JSON
    +envoyeLe: DateTime
  }
}

package "Administration" {
  class Specialite {
    +id: UUID
    +nom: String
    +description: String
    +totalMedecins: Number
    +statut: String
  }

  class FileAttente {
    +id: UUID
    +patientId: UUID
    +medecinDemande: UUID
    +specialiteId: UUID
    +datesPreferees: Date[]
    +urgence: String
    +statut: String
    +notes: String
    +assignerCreneau()
    +contacterPatient()
  }

  class PolitiqueAnnulation {
    +id: UUID
    +typeUtilisateur: String
    +heuresMinimumAvant: Number
    +configurerPolitique()
  }

  class PolitiqueReprogrammation {
    +id: UUID
    +heuresAvantRendezVous: Number
    +pourcentagePenalite: Decimal
    +maxReprogrammations: Number
  }

  class RapportModeration {
    +id: UUID
    +rapporteurId: UUID
    +rapporteId: UUID
    +raison: String
    +details: String
    +statut: String
    +resoluPar: UUID
    +resoluLe: DateTime
    +resoudre()
  }

  class MetriquesAdmin {
    +id: UUID
    +nom: String
    +categorie: String
    +valeur: Number
    +periode: String
  }

  class TicketSupport {
    +id: UUID
    +utilisateurId: UUID
    +sujet: String
    +categorie: String
    +description: String
    +statut: String
    +priorite: String
    +assigneA: UUID
    +resoluLe: DateTime
    +resoudre()
    +assigner()
  }
}

package "Messages" {
  class Message {
    +id: UUID
    +expediteurId: UUID
    +destinataireId: UUID
    +rendezVousId: UUID
    +sujet: String
    +contenu: String
    +estLu: Boolean
    +envoyer()
    +marquerCommeLu()
  }

  class Note {
    +id: UUID
    +patientId: UUID
    +medecinId: UUID
    +titre: String
    +contenu: String
    +date: Date
  }
}

' Relations d'héritage
Utilisateur <|-- Patient
Utilisateur <|-- Medecin
Utilisateur <|-- Administrateur

' Relations Patient
Patient "1" -- "*" RendezVous : prend
Patient "1" -- "*" DossierMedical : possède
Patient "1" -- "*" Document : reçoit
Patient "1" -- "*" Facture : paie
Patient "1" -- "*" Evaluation : donne
Patient "1" -- "*" Notification : reçoit
Patient "1" -- "*" FileAttente : rejoint
Patient "1" -- "*" ResultatLabo : possède
Patient "1" -- "*" ImageMedicale : possède
Patient "1" -- "*" Vaccination : reçoit
Patient "1" -- "*" LogSMS : reçoit

' Relations Médecin
Medecin "1" -- "*" RendezVous : gère
Medecin "1" -- "*" DossierMedical : crée
Medecin "1" -- "*" Document : signe
Medecin "1" -- "1" Specialite : appartient
Medecin "1" -- "*" Evaluation : reçoit

' Relations RendezVous
RendezVous "1" -- "1" Facture : génère
RendezVous "1" -- "*" Rappel : déclenche
RendezVous "1" -- "*" Notification : génère

' Relations Admin
Administrateur "1" -- "*" Specialite : gère
Administrateur "1" -- "*" RapportModeration : traite
Administrateur "1" -- "*" DemandeApplicationMedecin : approuve

@enduml`;

const downloadPlantUML = () => {
  const blob = new Blob([plantUMLCode], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'JammSante_ClassDiagram.puml';
  a.click();
  URL.revokeObjectURL(url);
};

export const ClassDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Diagramme de Classes</h2>
        <Button variant="outline" size="sm" onClick={downloadPlantUML}>
          <Download className="h-4 w-4 mr-2" />
          Export PlantUML (StarUML)
        </Button>
      </div>
      <p className="text-muted-foreground mb-4">
        Ce diagramme illustre les principales classes de l'application JàmmSanté incluant: gestion des rendez-vous, 
        rappels SMS automatiques, workflow d'approbation médecin, paiements et dossiers médicaux.
      </p>
      <div className="bg-muted/50 p-4 rounded-lg overflow-auto">
        <div ref={diagramRef} className="mermaid">
          {`
            classDiagram
              class Utilisateur {
                +String id
                +String nom
                +String prenom
                +String email
                +String telephone
                +String role
                +authentifier()
                +gererProfil()
              }
              
              class Patient {
                +String dateNaissance
                +String sexe
                +String groupeSanguin
                +String[] allergies
                +JSON antecedentsMedicaux
                +JSON beneficiaires
                +Boolean estActif
                +prendreRendezVous()
                +consulterDossierMedical()
                +payerConsultation()
                +recevoirRappelsSMS()
                +annulerRendezVous()
                +reprogrammerRendezVous()
                +noterMedecin()
                +telechargerFacturePDF()
              }
              
              class Medecin {
                +String specialiteId
                +String numeroLicence
                +Number anneesExperience
                +Boolean estVerifie
                +String adresse
                +Number latitude
                +Number longitude
                +gererRendezVous()
                +creerOrdonnance()
                +teleconsultation()
                +gererDocuments()
                +signerDocuments()
                +accederDossierPatient()
                +confirmerRendezVous()
                +envoyerSMSConfirmation()
              }
              
              class Administrateur {
                +gererUtilisateurs()
                +modererContenu()
                +consulterAnalytics()
                +gererPaiements()
                +gererNotifications()
                +gererSpecialites()
                +approuverMedecins()
                +gererFileAttente()
                +gererRappelsSMS()
                +configurerPolitiques()
              }
              
              class RendezVous {
                +String id
                +UUID medecinId
                +UUID patientId
                +Date date
                +Time heure
                +String type
                +String mode
                +String statut
                +String lieu
                +JSON notes
                +Decimal montant
                +String statutPaiement
                +reprogrammer()
                +annuler()
                +confirmer()
                +terminer()
                +programmerRappelSMS()
              }
              
              class DossierMedical {
                +String id
                +UUID patientId
                +UUID medecinId
                +String diagnostic
                +String prescription
                +String notes
                +Date date
                +consulter()
                +genererPDF()
              }
              
              class Document {
                +String id
                +UUID patientId
                +UUID medecinId
                +String titre
                +String type
                +String urlFichier
                +Boolean estSigne
                +DateTime signeLe
                +creer()
                +signer()
                +telechargerPDF()
              }
              
              class Facture {
                +String id
                +UUID rendezVousId
                +UUID patientId
                +UUID medecinId
                +Decimal montant
                +String statutPaiement
                +String methodePaiement
                +DateTime datePaiement
                +String numeroFacture
                +genererPDF()
              }
              
              class Notification {
                +String id
                +UUID utilisateurId
                +UUID rendezVousId
                +String type
                +String titre
                +String message
                +String priorite
                +Boolean estLue
                +JSON metadata
                +marquerCommeLue()
                +envoyer()
              }
              
              class Rappel {
                +String id
                +UUID rendezVousId
                +UUID patientId
                +DateTime programmePour
                +String typeRappel
                +String methode
                +Number tentatives
                +String statut
                +programmer()
                +envoyerSMS()
                +annuler()
              }
              
              class LogSMS {
                +String id
                +UUID utilisateurId
                +String numeroTelephone
                +String message
                +String statut
                +JSON reponseFournisseur
                +DateTime envoyeLe
              }
              
              class DemandeApplicationMedecin {
                +String id
                +String email
                +String prenom
                +String nom
                +UUID specialiteId
                +String numeroLicence
                +Number anneesExperience
                +String urlDiplome
                +String statut
                +String raisonRejet
                +approuver()
                +rejeter()
              }
              
              class Specialite {
                +String id
                +String nom
                +String description
                +Number totalMedecins
                +String statut
              }
              
              class FileAttente {
                +String id
                +UUID patientId
                +UUID medecinDemande
                +UUID specialiteId
                +Date[] datesPreferees
                +String urgence
                +String statut
                +assignerCreneau()
              }
              
              class Evaluation {
                +String id
                +UUID patientId
                +UUID medecinId
                +UUID rendezVousId
                +Number note
                +String commentaire
              }

              Utilisateur <|-- Patient
              Utilisateur <|-- Medecin
              Utilisateur <|-- Administrateur
              
              Patient "1" -- "*" RendezVous
              Medecin "1" -- "*" RendezVous
              Patient "1" -- "*" DossierMedical
              Medecin "1" -- "*" DossierMedical
              Medecin "1" -- "*" Document
              Patient "1" -- "*" Document
              RendezVous "1" -- "1" Facture
              
              RendezVous "1" -- "*" Notification
              RendezVous "1" -- "*" Rappel
              Rappel "1" -- "*" LogSMS
              
              Patient "1" -- "*" FileAttente
              Medecin "*" -- "1" Specialite
              Patient "1" -- "*" Evaluation
              Medecin "1" -- "*" Evaluation
              
              DemandeApplicationMedecin "*" -- "1" Specialite
              Administrateur "1" -- "*" DemandeApplicationMedecin
          `}
        </div>
      </div>
    </div>
  );
};
