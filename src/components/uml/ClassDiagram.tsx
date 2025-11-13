
import React, { useRef, useEffect } from "react";
import mermaid from "mermaid";

export const ClassDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (diagramRef.current) {
      mermaid.contentLoaded();
    }
  }, [diagramRef]);

  return (
    <div className="border-t pt-8">
      <h2 className="text-2xl font-bold mb-4">Diagramme de Classes</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Ce diagramme illustre les principales classes de l'application JàmmSanté et leurs relations.
      </p>
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
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
                +String[] antecedentsMedicaux
                +RendezVous[] rendezVous
                +prendreRendezVous()
                +consulterDossierMedical()
                +payerConsultation()
                +recevoirRappels()
              }
              
              class Medecin {
                +String specialite
                +String[] qualifications
                +String numeroLicence
                +Number anneesExperience
                +Boolean estVerifie
                +RendezVous[] agenda
                +DisponibiliteSlot[] disponibilites
                +gererRendezVous()
                +creerOrdonnance()
                +telconsultation()
                +gererDocuments()
                +definirTarifs()
              }
              
              class Administrateur {
                +gererUtilisateurs()
                +modererContenu()
                +consulterAnalytics()
                +gererPaiements()
                +gererNotifications()
                +gererSpecialites()
              }
              
              class RendezVous {
                +String id
                +Medecin medecin
                +Patient patient
                +DateTime date
                +Time heure
                +String type
                +String mode
                +String statut
                +String lieu
                +Number prix
                +String notes
                +DateTime annuleLe
                +String raisonAnnulation
                +reprogrammer()
                +annuler()
                +confirmer()
                +notifierRappel()
              }
              
              class DossierMedical {
                +String id
                +Patient patient
                +Medecin medecin
                +String[] diagnostics
                +DateTime date
                +String notes
                +Ordonnance[] ordonnances
                +consulter()
                +modifier()
              }
              
              class Ordonnance {
                +String id
                +Patient patient
                +Medecin medecin
                +String[] medicaments
                +String posologie
                +DateTime date
                +String instructions
                +Boolean estActive
                +genererPDF()
              }
              
              class Ticket {
                +String id
                +RendezVous rendezVous
                +String statutPaiement
                +String methodePaiement
                +Number montant
                +DateTime datePaiement
                +genererRecu()
              }
              
              class Notification {
                +String id
                +String destinataire
                +String type
                +String titre
                +String message
                +String priorite
                +Boolean estLue
                +DateTime dateCreation
                +marquerCommeLue()
                +envoyer()
              }
              
              class Rappel {
                +String id
                +RendezVous rendezVous
                +String typeRappel
                +String methode
                +DateTime programmePour
                +Number tentatives
                +String statut
                +programmer()
                +executer()
              }
              
              class FileAttente {
                +String id
                +Patient patient
                +Medecin medecinSouhaite
                +Specialite specialite
                +String[] datesPreferees
                +String urgence
                +String statut
                +String notes
                +assignerCreneau()
                +contacterPatient()
              }
              
              class Specialite {
                +String id
                +String nom
                +String description
                +Number totalMedecins
                +String statut
                +gerer()
              }
              
              class Transaction {
                +String id
                +Patient patient
                +RendezVous rendezVous
                +Number montant
                +String devise
                +String methode
                +String statut
                +DateTime dateTransaction
                +traiter()
                +rembourser()
              }
              
              class ContenuSite {
                +String id
                +String titre
                +String contenu
                +String slug
                +String statut
                +String auteur
                +DateTime derniereModification
                +publier()
                +modifier()
              }
              
              class FAQ {
                +String id
                +String question
                +String reponse
                +String categorie
                +Boolean estActive
                +Number ordre
                +gerer()
              }

              Utilisateur <|-- Patient
              Utilisateur <|-- Medecin
              Utilisateur <|-- Administrateur
              
              Patient "1" -- "*" RendezVous
              Medecin "1" -- "*" RendezVous
              Patient "1" -- "*" DossierMedical
              Medecin "1" -- "*" DossierMedical
              Medecin "1" -- "*" Ordonnance
              Patient "1" -- "*" Ordonnance
              RendezVous "1" -- "1" Ticket
              
              RendezVous "1" -- "*" Notification
              RendezVous "1" -- "*" Rappel
              Patient "1" -- "*" FileAttente
              Medecin "*" -- "1" Specialite
              
              RendezVous "1" -- "1" Transaction
              Patient "1" -- "*" Transaction
              
              Administrateur "1" -- "*" ContenuSite
              Administrateur "1" -- "*" FAQ
              Administrateur "1" -- "*" Specialite
          `}
        </div>
      </div>
    </div>
  );
};
