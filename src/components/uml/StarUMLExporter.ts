// StarUML MDJ format generator
// MDJ is a JSON-based format used by StarUML

export interface MDJElement {
  _type: string;
  _id: string;
  _parent?: { $ref: string };
  name?: string;
  [key: string]: any;
}

// Generate unique ID for MDJ elements
const generateId = () => {
  return 'AAAAAAF' + Math.random().toString(36).substring(2, 15).toUpperCase();
};

// Create the complete JàmmSanté MDJ project
export const generateJammSanteMDJ = (): string => {
  const projectId = generateId();
  const classModelId = generateId();
  const useCaseModelId = generateId();
  const sequenceModelId = generateId();
  const stateModelId = generateId();
  const activityModelId = generateId();
  const erdModelId = generateId();

  const mdjProject = {
    _type: "Project",
    _id: projectId,
    name: "JàmmSanté",
    ownedElements: [
      // ===================== CLASS DIAGRAM MODEL =====================
      {
        _type: "UMLModel",
        _id: classModelId,
        _parent: { $ref: projectId },
        name: "Modèle de Classes",
        ownedElements: [
          // Package Utilisateurs
          {
            _type: "UMLPackage",
            _id: generateId(),
            _parent: { $ref: classModelId },
            name: "Utilisateurs",
            ownedElements: [
              // Classe Utilisateur (abstraite)
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "Utilisateur",
                isAbstract: true,
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "nom", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "prenom", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "email", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "telephone", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "adresse", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "avatarUrl", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "role", type: "AppRole", visibility: "public" }
                ],
                operations: [
                  { _type: "UMLOperation", name: "authentifier", visibility: "public" },
                  { _type: "UMLOperation", name: "gererProfil", visibility: "public" }
                ]
              },
              // Classe Patient
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "Patient",
                attributes: [
                  { _type: "UMLAttribute", name: "dateNaissance", type: "Date", visibility: "public" },
                  { _type: "UMLAttribute", name: "sexe", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "groupeSanguin", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "allergies", type: "String[]", visibility: "public" },
                  { _type: "UMLAttribute", name: "antecedentsMedicaux", type: "JSON", visibility: "public" },
                  { _type: "UMLAttribute", name: "beneficiaires", type: "JSON", visibility: "public" },
                  { _type: "UMLAttribute", name: "estActif", type: "Boolean", visibility: "public" }
                ],
                operations: [
                  { _type: "UMLOperation", name: "prendreRendezVous", visibility: "public" },
                  { _type: "UMLOperation", name: "consulterDossierMedical", visibility: "public" },
                  { _type: "UMLOperation", name: "payerConsultation", visibility: "public" },
                  { _type: "UMLOperation", name: "recevoirRappelsSMS", visibility: "public" },
                  { _type: "UMLOperation", name: "annulerRendezVous", visibility: "public" },
                  { _type: "UMLOperation", name: "reprogrammerRendezVous", visibility: "public" },
                  { _type: "UMLOperation", name: "noterMedecin", visibility: "public" },
                  { _type: "UMLOperation", name: "telechargerFacturePDF", visibility: "public" }
                ]
              },
              // Classe Médecin
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "Medecin",
                attributes: [
                  { _type: "UMLAttribute", name: "specialiteId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "numeroLicence", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "anneesExperience", type: "Number", visibility: "public" },
                  { _type: "UMLAttribute", name: "estVerifie", type: "Boolean", visibility: "public" },
                  { _type: "UMLAttribute", name: "adresse", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "latitude", type: "Decimal", visibility: "public" },
                  { _type: "UMLAttribute", name: "longitude", type: "Decimal", visibility: "public" }
                ],
                operations: [
                  { _type: "UMLOperation", name: "gererRendezVous", visibility: "public" },
                  { _type: "UMLOperation", name: "creerOrdonnance", visibility: "public" },
                  { _type: "UMLOperation", name: "teleconsultation", visibility: "public" },
                  { _type: "UMLOperation", name: "signerDocuments", visibility: "public" },
                  { _type: "UMLOperation", name: "confirmerRendezVous", visibility: "public" },
                  { _type: "UMLOperation", name: "envoyerSMSConfirmation", visibility: "public" }
                ]
              },
              // Classe Administrateur
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "Administrateur",
                operations: [
                  { _type: "UMLOperation", name: "gererUtilisateurs", visibility: "public" },
                  { _type: "UMLOperation", name: "modererContenu", visibility: "public" },
                  { _type: "UMLOperation", name: "consulterAnalytics", visibility: "public" },
                  { _type: "UMLOperation", name: "gererPaiements", visibility: "public" },
                  { _type: "UMLOperation", name: "approuverMedecins", visibility: "public" },
                  { _type: "UMLOperation", name: "gererRappelsSMS", visibility: "public" },
                  { _type: "UMLOperation", name: "configurerPolitiques", visibility: "public" }
                ]
              }
            ]
          },
          // Package Rendez-vous
          {
            _type: "UMLPackage",
            _id: generateId(),
            _parent: { $ref: classModelId },
            name: "Rendez-vous",
            ownedElements: [
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "RendezVous",
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "medecinId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "patientId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "date", type: "Date", visibility: "public" },
                  { _type: "UMLAttribute", name: "heure", type: "Time", visibility: "public" },
                  { _type: "UMLAttribute", name: "type", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "mode", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "statut", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "montantPaiement", type: "Decimal", visibility: "public" },
                  { _type: "UMLAttribute", name: "statutPaiement", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "nombreReprogrammations", type: "Number", visibility: "public" }
                ],
                operations: [
                  { _type: "UMLOperation", name: "reprogrammer", visibility: "public" },
                  { _type: "UMLOperation", name: "annuler", visibility: "public" },
                  { _type: "UMLOperation", name: "confirmer", visibility: "public" },
                  { _type: "UMLOperation", name: "terminer", visibility: "public" },
                  { _type: "UMLOperation", name: "marquerAbsent", visibility: "public" },
                  { _type: "UMLOperation", name: "programmerRappelSMS", visibility: "public" }
                ]
              },
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "DemandeApplicationMedecin",
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "email", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "prenom", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "nom", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "specialiteId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "numeroLicence", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "urlDiplome", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "statut", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "raisonRejet", type: "String", visibility: "public" }
                ],
                operations: [
                  { _type: "UMLOperation", name: "approuver", visibility: "public" },
                  { _type: "UMLOperation", name: "rejeter", visibility: "public" }
                ]
              }
            ]
          },
          // Package Médical
          {
            _type: "UMLPackage",
            _id: generateId(),
            _parent: { $ref: classModelId },
            name: "Medical",
            ownedElements: [
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "DossierMedical",
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "patientId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "medecinId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "diagnostic", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "prescription", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "notes", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "date", type: "Date", visibility: "public" }
                ]
              },
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "Document",
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "patientId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "medecinId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "titre", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "type", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "urlFichier", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "estSigne", type: "Boolean", visibility: "public" }
                ],
                operations: [
                  { _type: "UMLOperation", name: "signer", visibility: "public" },
                  { _type: "UMLOperation", name: "telecharger", visibility: "public" }
                ]
              },
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "ResultatLabo",
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "patientId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "nomTest", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "dateTest", type: "Date", visibility: "public" },
                  { _type: "UMLAttribute", name: "resultats", type: "String", visibility: "public" }
                ]
              },
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "ImageMedicale",
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "patientId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "typeImage", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "urlImage", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "dateImage", type: "Date", visibility: "public" }
                ]
              },
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "Vaccination",
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "patientId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "nomVaccin", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "dateVaccination", type: "Date", visibility: "public" },
                  { _type: "UMLAttribute", name: "prochaineDose", type: "Date", visibility: "public" }
                ]
              }
            ]
          },
          // Package Paiements
          {
            _type: "UMLPackage",
            _id: generateId(),
            _parent: { $ref: classModelId },
            name: "Paiements",
            ownedElements: [
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "Facture",
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "rendezVousId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "patientId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "medecinId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "montant", type: "Decimal", visibility: "public" },
                  { _type: "UMLAttribute", name: "statutPaiement", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "methodePaiement", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "numeroFacture", type: "String", visibility: "public" }
                ],
                operations: [
                  { _type: "UMLOperation", name: "genererPDF", visibility: "public" },
                  { _type: "UMLOperation", name: "envoyer", visibility: "public" }
                ]
              },
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "Evaluation",
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "patientId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "medecinId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "rendezVousId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "note", type: "Number", visibility: "public" },
                  { _type: "UMLAttribute", name: "commentaire", type: "String", visibility: "public" }
                ]
              }
            ]
          },
          // Package Notifications
          {
            _type: "UMLPackage",
            _id: generateId(),
            _parent: { $ref: classModelId },
            name: "Notifications",
            ownedElements: [
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "Notification",
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "utilisateurId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "type", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "titre", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "message", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "priorite", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "estLue", type: "Boolean", visibility: "public" }
                ],
                operations: [
                  { _type: "UMLOperation", name: "marquerCommeLue", visibility: "public" },
                  { _type: "UMLOperation", name: "envoyer", visibility: "public" }
                ]
              },
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "Rappel",
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "rendezVousId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "patientId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "programmePour", type: "DateTime", visibility: "public" },
                  { _type: "UMLAttribute", name: "typeRappel", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "methode", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "tentatives", type: "Number", visibility: "public" },
                  { _type: "UMLAttribute", name: "statut", type: "String", visibility: "public" }
                ],
                operations: [
                  { _type: "UMLOperation", name: "programmer", visibility: "public" },
                  { _type: "UMLOperation", name: "executer", visibility: "public" },
                  { _type: "UMLOperation", name: "annuler", visibility: "public" }
                ]
              },
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "LogSMS",
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "utilisateurId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "numeroTelephone", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "message", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "statut", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "reponseFournisseur", type: "JSON", visibility: "public" },
                  { _type: "UMLAttribute", name: "envoyeLe", type: "DateTime", visibility: "public" }
                ]
              }
            ]
          },
          // Package Administration
          {
            _type: "UMLPackage",
            _id: generateId(),
            _parent: { $ref: classModelId },
            name: "Administration",
            ownedElements: [
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "Specialite",
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "nom", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "description", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "totalMedecins", type: "Number", visibility: "public" },
                  { _type: "UMLAttribute", name: "statut", type: "String", visibility: "public" }
                ]
              },
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "FileAttente",
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "patientId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "specialiteId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "urgence", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "statut", type: "String", visibility: "public" }
                ],
                operations: [
                  { _type: "UMLOperation", name: "assignerCreneau", visibility: "public" },
                  { _type: "UMLOperation", name: "contacterPatient", visibility: "public" }
                ]
              },
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "PolitiqueAnnulation",
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "typeUtilisateur", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "heuresMinimumAvant", type: "Number", visibility: "public" }
                ]
              },
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "PolitiqueReprogrammation",
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "heuresAvantRendezVous", type: "Number", visibility: "public" },
                  { _type: "UMLAttribute", name: "pourcentagePenalite", type: "Decimal", visibility: "public" },
                  { _type: "UMLAttribute", name: "maxReprogrammations", type: "Number", visibility: "public" }
                ]
              },
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "TicketSupport",
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "utilisateurId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "sujet", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "categorie", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "statut", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "priorite", type: "String", visibility: "public" }
                ],
                operations: [
                  { _type: "UMLOperation", name: "resoudre", visibility: "public" },
                  { _type: "UMLOperation", name: "assigner", visibility: "public" }
                ]
              }
            ]
          },
          // Package Messages
          {
            _type: "UMLPackage",
            _id: generateId(),
            _parent: { $ref: classModelId },
            name: "Messages",
            ownedElements: [
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "Message",
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "expediteurId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "destinataireId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "sujet", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "contenu", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "estLu", type: "Boolean", visibility: "public" }
                ],
                operations: [
                  { _type: "UMLOperation", name: "envoyer", visibility: "public" },
                  { _type: "UMLOperation", name: "marquerCommeLu", visibility: "public" }
                ]
              },
              {
                _type: "UMLClass",
                _id: generateId(),
                name: "Note",
                attributes: [
                  { _type: "UMLAttribute", name: "id", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "patientId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "medecinId", type: "UUID", visibility: "public" },
                  { _type: "UMLAttribute", name: "titre", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "contenu", type: "String", visibility: "public" },
                  { _type: "UMLAttribute", name: "date", type: "Date", visibility: "public" }
                ]
              }
            ]
          }
        ]
      },
      // ===================== USE CASE MODEL =====================
      {
        _type: "UMLModel",
        _id: useCaseModelId,
        _parent: { $ref: projectId },
        name: "Cas d'Utilisation",
        ownedElements: [
          {
            _type: "UMLActor",
            _id: generateId(),
            name: "Patient"
          },
          {
            _type: "UMLActor",
            _id: generateId(),
            name: "Médecin"
          },
          {
            _type: "UMLActor",
            _id: generateId(),
            name: "Administrateur"
          },
          {
            _type: "UMLActor",
            _id: generateId(),
            name: "Système"
          },
          // Use Cases Patient
          { _type: "UMLUseCase", _id: generateId(), name: "S'inscrire" },
          { _type: "UMLUseCase", _id: generateId(), name: "Se connecter" },
          { _type: "UMLUseCase", _id: generateId(), name: "Rechercher médecin" },
          { _type: "UMLUseCase", _id: generateId(), name: "Filtrer par spécialité" },
          { _type: "UMLUseCase", _id: generateId(), name: "Filtrer par localisation" },
          { _type: "UMLUseCase", _id: generateId(), name: "Prendre rendez-vous" },
          { _type: "UMLUseCase", _id: generateId(), name: "Renseigner infos médicales" },
          { _type: "UMLUseCase", _id: generateId(), name: "Payer via Wave" },
          { _type: "UMLUseCase", _id: generateId(), name: "Payer via Orange Money" },
          { _type: "UMLUseCase", _id: generateId(), name: "Payer via Free Money" },
          { _type: "UMLUseCase", _id: generateId(), name: "Payer par carte bancaire" },
          { _type: "UMLUseCase", _id: generateId(), name: "Consulter ticket RDV" },
          { _type: "UMLUseCase", _id: generateId(), name: "Télécharger ticket PDF" },
          { _type: "UMLUseCase", _id: generateId(), name: "Annuler rendez-vous" },
          { _type: "UMLUseCase", _id: generateId(), name: "Reprogrammer rendez-vous" },
          { _type: "UMLUseCase", _id: generateId(), name: "Recevoir rappels SMS" },
          { _type: "UMLUseCase", _id: generateId(), name: "Consulter dossier médical" },
          { _type: "UMLUseCase", _id: generateId(), name: "Voir ordonnances" },
          { _type: "UMLUseCase", _id: generateId(), name: "Télécharger facture PDF" },
          { _type: "UMLUseCase", _id: generateId(), name: "Noter médecin" },
          { _type: "UMLUseCase", _id: generateId(), name: "Utiliser chatbot" },
          { _type: "UMLUseCase", _id: generateId(), name: "Contacter WhatsApp" },
          // Use Cases Médecin
          { _type: "UMLUseCase", _id: generateId(), name: "Postuler comme médecin" },
          { _type: "UMLUseCase", _id: generateId(), name: "Soumettre documents" },
          { _type: "UMLUseCase", _id: generateId(), name: "Gérer rendez-vous" },
          { _type: "UMLUseCase", _id: generateId(), name: "Voir infos patient avant RDV" },
          { _type: "UMLUseCase", _id: generateId(), name: "Confirmer rendez-vous" },
          { _type: "UMLUseCase", _id: generateId(), name: "Envoyer SMS confirmation" },
          { _type: "UMLUseCase", _id: generateId(), name: "Créer dossier médical" },
          { _type: "UMLUseCase", _id: generateId(), name: "Rédiger ordonnance" },
          { _type: "UMLUseCase", _id: generateId(), name: "Signer document" },
          { _type: "UMLUseCase", _id: generateId(), name: "Faire téléconsultation" },
          // Use Cases Admin
          { _type: "UMLUseCase", _id: generateId(), name: "Gérer utilisateurs" },
          { _type: "UMLUseCase", _id: generateId(), name: "Approuver demandes médecins" },
          { _type: "UMLUseCase", _id: generateId(), name: "Rejeter demandes médecins" },
          { _type: "UMLUseCase", _id: generateId(), name: "Gérer spécialités" },
          { _type: "UMLUseCase", _id: generateId(), name: "Consulter analytics" },
          { _type: "UMLUseCase", _id: generateId(), name: "Configurer rappels SMS" },
          { _type: "UMLUseCase", _id: generateId(), name: "Gérer politiques annulation" },
          // Use Cases Système
          { _type: "UMLUseCase", _id: generateId(), name: "Programmer rappels 24h" },
          { _type: "UMLUseCase", _id: generateId(), name: "Envoyer SMS automatiques" },
          { _type: "UMLUseCase", _id: generateId(), name: "Traiter paiements" },
          { _type: "UMLUseCase", _id: generateId(), name: "Générer notifications" },
          { _type: "UMLUseCase", _id: generateId(), name: "Exécuter cron jobs" }
        ]
      },
      // ===================== STATE MACHINE MODEL =====================
      {
        _type: "UMLModel",
        _id: stateModelId,
        _parent: { $ref: projectId },
        name: "États Rendez-vous",
        ownedElements: [
          {
            _type: "UMLStateMachine",
            _id: generateId(),
            name: "Cycle de Vie Rendez-vous",
            regions: [
              {
                _type: "UMLRegion",
                _id: generateId(),
                vertices: [
                  { _type: "UMLPseudostate", _id: generateId(), name: "Initial", kind: "initial" },
                  { _type: "UMLState", _id: generateId(), name: "EnAttentePaiement" },
                  { _type: "UMLState", _id: generateId(), name: "EnAttente" },
                  { _type: "UMLState", _id: generateId(), name: "Confirmé" },
                  { _type: "UMLState", _id: generateId(), name: "Reprogrammé" },
                  { _type: "UMLState", _id: generateId(), name: "EnConsultation" },
                  { _type: "UMLState", _id: generateId(), name: "Terminé" },
                  { _type: "UMLState", _id: generateId(), name: "Absent" },
                  { _type: "UMLState", _id: generateId(), name: "Annulé" },
                  { _type: "UMLFinalState", _id: generateId(), name: "Final" }
                ]
              }
            ]
          }
        ]
      },
      // ===================== ACTIVITY MODEL =====================
      {
        _type: "UMLModel",
        _id: activityModelId,
        _parent: { $ref: projectId },
        name: "Processus Consultation",
        ownedElements: [
          {
            _type: "UMLActivity",
            _id: generateId(),
            name: "Processus Complet Consultation",
            nodes: [
              { _type: "UMLInitialNode", _id: generateId(), name: "Début" },
              { _type: "UMLAction", _id: generateId(), name: "Rechercher médecin" },
              { _type: "UMLAction", _id: generateId(), name: "Filtrer résultats" },
              { _type: "UMLDecisionNode", _id: generateId(), name: "Créneaux disponibles?" },
              { _type: "UMLAction", _id: generateId(), name: "Sélectionner créneau" },
              { _type: "UMLAction", _id: generateId(), name: "Renseigner infos médicales" },
              { _type: "UMLAction", _id: generateId(), name: "Choisir paiement" },
              { _type: "UMLForkNode", _id: generateId(), name: "Fork Paiement" },
              { _type: "UMLAction", _id: generateId(), name: "Wave" },
              { _type: "UMLAction", _id: generateId(), name: "Orange Money" },
              { _type: "UMLAction", _id: generateId(), name: "Free Money" },
              { _type: "UMLAction", _id: generateId(), name: "Carte Bancaire" },
              { _type: "UMLJoinNode", _id: generateId(), name: "Join Paiement" },
              { _type: "UMLDecisionNode", _id: generateId(), name: "Paiement réussi?" },
              { _type: "UMLAction", _id: generateId(), name: "Créer RDV" },
              { _type: "UMLAction", _id: generateId(), name: "Programmer rappel SMS" },
              { _type: "UMLAction", _id: generateId(), name: "Médecin confirme" },
              { _type: "UMLAction", _id: generateId(), name: "Envoyer SMS confirmation" },
              { _type: "UMLAction", _id: generateId(), name: "Rappel 24h avant" },
              { _type: "UMLDecisionNode", _id: generateId(), name: "Patient présent?" },
              { _type: "UMLAction", _id: generateId(), name: "Consultation" },
              { _type: "UMLAction", _id: generateId(), name: "Créer dossier médical" },
              { _type: "UMLAction", _id: generateId(), name: "Générer facture PDF" },
              { _type: "UMLAction", _id: generateId(), name: "Patient note médecin" },
              { _type: "UMLAction", _id: generateId(), name: "Marquer absent" },
              { _type: "UMLDecisionNode", _id: generateId(), name: "Excuse valide?" },
              { _type: "UMLAction", _id: generateId(), name: "Appliquer pénalité" },
              { _type: "UMLAction", _id: generateId(), name: "Reprogrammation gratuite" },
              { _type: "UMLActivityFinalNode", _id: generateId(), name: "Fin" }
            ]
          }
        ]
      },
      // ===================== SEQUENCE MODEL =====================
      {
        _type: "UMLModel",
        _id: sequenceModelId,
        _parent: { $ref: projectId },
        name: "Diagrammes de Séquence",
        ownedElements: [
          {
            _type: "UMLCollaboration",
            _id: generateId(),
            name: "Prise de Rendez-vous",
            ownedElements: [
              {
                _type: "UMLInteraction",
                _id: generateId(),
                name: "Séquence Rendez-vous Complet avec SMS",
                participants: [
                  { _type: "UMLLifeline", _id: generateId(), name: "Patient" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Interface Web" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Système JàmmSanté" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Base de Données" },
                  { _type: "UMLLifeline", _id: generateId(), name: "PayTech" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Dexchange SMS" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Notifications" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Cron Rappels" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Médecin" }
                ]
              }
            ]
          },
          {
            _type: "UMLCollaboration",
            _id: generateId(),
            name: "Approbation Médecin",
            ownedElements: [
              {
                _type: "UMLInteraction",
                _id: generateId(),
                name: "Workflow Approbation Médecin",
                participants: [
                  { _type: "UMLLifeline", _id: generateId(), name: "Candidat Médecin" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Interface Web" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Système" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Base de Données" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Storage" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Service Email" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Administrateur" }
                ]
              }
            ]
          },
          {
            _type: "UMLCollaboration",
            _id: generateId(),
            name: "Paiement PayTech",
            ownedElements: [
              {
                _type: "UMLInteraction",
                _id: generateId(),
                name: "Paiement Multi-Méthodes",
                participants: [
                  { _type: "UMLLifeline", _id: generateId(), name: "Patient" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Interface Web" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Système" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Edge Function" },
                  { _type: "UMLLifeline", _id: generateId(), name: "PayTech API" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Base de Données" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Notifications" }
                ]
              }
            ]
          },
          {
            _type: "UMLCollaboration",
            _id: generateId(),
            name: "Téléconsultation",
            ownedElements: [
              {
                _type: "UMLInteraction",
                _id: generateId(),
                name: "Flux Téléconsultation",
                participants: [
                  { _type: "UMLLifeline", _id: generateId(), name: "Patient" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Interface Patient" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Système" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Service Vidéo" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Base de Données" },
                  { _type: "UMLLifeline", _id: generateId(), name: "SMS" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Notifications" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Interface Médecin" },
                  { _type: "UMLLifeline", _id: generateId(), name: "Médecin" }
                ]
              }
            ]
          }
        ]
      },
      // ===================== ERD MODEL =====================
      {
        _type: "UMLModel",
        _id: erdModelId,
        _parent: { $ref: projectId },
        name: "Schéma Base de Données",
        ownedElements: [
          {
            _type: "ERDDataModel",
            _id: generateId(),
            name: "Supabase Database Schema",
            ownedElements: [
              { _type: "ERDEntity", _id: generateId(), name: "profiles", columns: [
                { name: "id", type: "UUID", primaryKey: true },
                { name: "first_name", type: "TEXT" },
                { name: "last_name", type: "TEXT" },
                { name: "email", type: "TEXT" },
                { name: "phone_number", type: "TEXT" }
              ]},
              { _type: "ERDEntity", _id: generateId(), name: "patients", columns: [
                { name: "id", type: "UUID", primaryKey: true, foreignKey: true },
                { name: "birth_date", type: "DATE" },
                { name: "gender", type: "TEXT" },
                { name: "blood_type", type: "TEXT" },
                { name: "allergies", type: "TEXT[]" },
                { name: "medical_history", type: "JSONB" }
              ]},
              { _type: "ERDEntity", _id: generateId(), name: "doctors", columns: [
                { name: "id", type: "UUID", primaryKey: true, foreignKey: true },
                { name: "specialty_id", type: "UUID", foreignKey: true },
                { name: "license_number", type: "TEXT" },
                { name: "is_verified", type: "BOOLEAN" }
              ]},
              { _type: "ERDEntity", _id: generateId(), name: "appointments", columns: [
                { name: "id", type: "UUID", primaryKey: true },
                { name: "doctor_id", type: "UUID", foreignKey: true },
                { name: "patient_id", type: "UUID", foreignKey: true },
                { name: "date", type: "DATE" },
                { name: "time", type: "TIME" },
                { name: "status", type: "TEXT" },
                { name: "payment_status", type: "TEXT" }
              ]},
              { _type: "ERDEntity", _id: generateId(), name: "reminders", columns: [
                { name: "id", type: "UUID", primaryKey: true },
                { name: "appointment_id", type: "UUID", foreignKey: true },
                { name: "patient_id", type: "UUID", foreignKey: true },
                { name: "scheduled_for", type: "TIMESTAMP" },
                { name: "status", type: "TEXT" }
              ]},
              { _type: "ERDEntity", _id: generateId(), name: "sms_logs", columns: [
                { name: "id", type: "UUID", primaryKey: true },
                { name: "user_id", type: "UUID", foreignKey: true },
                { name: "phone_number", type: "TEXT" },
                { name: "message", type: "TEXT" },
                { name: "status", type: "TEXT" }
              ]},
              { _type: "ERDEntity", _id: generateId(), name: "specialties", columns: [
                { name: "id", type: "UUID", primaryKey: true },
                { name: "name", type: "TEXT" },
                { name: "total_doctors", type: "INTEGER" }
              ]}
            ]
          }
        ]
      }
    ]
  };

  return JSON.stringify(mdjProject, null, 2);
};

// Download function for MDJ file
export const downloadMDJFile = () => {
  const mdjContent = generateJammSanteMDJ();
  const blob = new Blob([mdjContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'JammSante_Complete.mdj';
  a.click();
  URL.revokeObjectURL(url);
};
