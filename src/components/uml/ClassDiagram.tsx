
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";
import { DiagramExportButtons } from "./DiagramExportButtons";

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
    +gererFAQ()
    +gererPages()
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

package "Medical" {
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
    +urlSignature: String
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

  class JournalAudit {
    +id: UUID
    +adminId: UUID
    +typeAction: String
    +nomTable: String
    +enregistrementId: UUID
    +details: JSON
    +adresseIP: String
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

package "Contenu" {
  class FAQ {
    +id: UUID
    +question: String
    +reponse: String
    +categorie: String
    +ordreAffichage: Number
    +statut: String
    +creePar: UUID
    +creer()
    +modifier()
    +publier()
  }

  class Page {
    +id: UUID
    +titre: String
    +slug: String
    +contenu: String
    +statut: String
    +auteurId: UUID
    +creer()
    +modifier()
    +publier()
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

' Relations d heritage
Utilisateur <|-- Patient
Utilisateur <|-- Medecin
Utilisateur <|-- Administrateur

' Relations Patient
Patient "1" -- "*" RendezVous : prend
Patient "1" -- "*" DossierMedical : possede
Patient "1" -- "*" Document : recoit
Patient "1" -- "*" Facture : paie
Patient "1" -- "*" Evaluation : donne
Patient "1" -- "*" Notification : recoit
Patient "1" -- "*" FileAttente : rejoint
Patient "1" -- "*" ResultatLabo : possede
Patient "1" -- "*" ImageMedicale : possede
Patient "1" -- "*" Vaccination : recoit
Patient "1" -- "*" LogSMS : recoit

' Relations Medecin
Medecin "1" -- "*" RendezVous : gere
Medecin "1" -- "*" DossierMedical : cree
Medecin "1" -- "*" Document : signe
Medecin "1" -- "1" Specialite : appartient
Medecin "1" -- "*" Evaluation : recoit
Medecin "1" -- "*" Note : redige

' Relations RendezVous
RendezVous "1" -- "1" Facture : genere
RendezVous "1" -- "*" Rappel : declenche
RendezVous "1" -- "*" Notification : genere

' Relations Admin
Administrateur "1" -- "*" Specialite : gere
Administrateur "1" -- "*" RapportModeration : traite
Administrateur "1" -- "*" DemandeApplicationMedecin : approuve
Administrateur "1" -- "*" FAQ : gere
Administrateur "1" -- "*" Page : gere
Administrateur "1" -- "*" JournalAudit : genere

@enduml`;

const mermaidCode = `classDiagram
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
    +prendreRendezVous()
    +payerConsultation()
    +recevoirRappelsSMS()
  }
  class Medecin {
    +String specialiteId
    +String numeroLicence
    +gererRendezVous()
    +creerOrdonnance()
    +teleconsultation()
  }
  class Administrateur {
    +gererUtilisateurs()
    +modererContenu()
    +consulterAnalytics()
  }
  Utilisateur <|-- Patient
  Utilisateur <|-- Medecin
  Utilisateur <|-- Administrateur`;

export const ClassDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Diagramme de Classes</h2>
        <DiagramExportButtons
          plantUMLCode={plantUMLCode}
          mermaidCode={mermaidCode}
          diagramName="JammSante_ClassDiagram"
        />
      </div>
      <p className="text-muted-foreground mb-4">
        Ce diagramme illustre les 25 classes de l'application JammSante organisees en 8 packages : 
        Utilisateurs, Rendez-vous, Medical, Paiements, Notifications, Administration, Contenu et Messages.
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
                +gererFAQ()
                +gererPages()
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
                +String urlSignature
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

              class JournalAudit {
                +String id
                +UUID adminId
                +String typeAction
                +String nomTable
                +UUID enregistrementId
                +JSON details
                +String adresseIP
              }

              class FAQ {
                +String id
                +String question
                +String reponse
                +String categorie
                +Number ordreAffichage
                +String statut
                +creer()
                +modifier()
              }

              class Page {
                +String id
                +String titre
                +String slug
                +String contenu
                +String statut
                +UUID auteurId
                +creer()
                +modifier()
                +publier()
              }

              class Note {
                +String id
                +UUID patientId
                +UUID medecinId
                +String titre
                +String contenu
                +Date date
              }

              class Message {
                +String id
                +UUID expediteurId
                +UUID destinataireId
                +String sujet
                +String contenu
                +Boolean estLu
                +envoyer()
                +marquerCommeLu()
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
              Administrateur "1" -- "*" FAQ
              Administrateur "1" -- "*" Page
              Administrateur "1" -- "*" JournalAudit
              Medecin "1" -- "*" Note
          `}
        </div>
      </div>
    </div>
  );
};
