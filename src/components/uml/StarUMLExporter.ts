// StarUML MDJ format generator — complete JàmmSanté project
// MDJ is a JSON-based format used by StarUML

export interface MDJElement {
  _type: string;
  _id: string;
  _parent?: { $ref: string };
  name?: string;
  [key: string]: any;
}

let idCounter = 0;
const generateId = () => {
  idCounter++;
  return 'AAAAAAF' + idCounter.toString(36).toUpperCase().padStart(8, '0');
};

const resetIds = () => { idCounter = 0; };

const attr = (name: string, type: string, vis = "public") => ({
  _type: "UMLAttribute", _id: generateId(), name, type, visibility: vis
});

const op = (name: string, vis = "public") => ({
  _type: "UMLOperation", _id: generateId(), name, visibility: vis
});

const erdEntity = (name: string, columns: { name: string; type: string; pk?: boolean; fk?: boolean }[]) => ({
  _type: "ERDEntity",
  _id: generateId(),
  name,
  columns: columns.map(c => ({
    _type: "ERDColumn",
    _id: generateId(),
    name: c.name,
    type: c.type,
    primaryKey: c.pk || false,
    foreignKey: c.fk || false
  }))
});

export const generateJammSanteMDJ = (): string => {
  resetIds();
  const projectId = generateId();
  const classModelId = generateId();
  const useCaseModelId = generateId();
  const sequenceModelId = generateId();
  const stateModelId = generateId();
  const activityModelId = generateId();
  const erdModelId = generateId();
  const deploymentModelId = generateId();

  const mdjProject = {
    _type: "Project",
    _id: projectId,
    name: "JàmmSanté",
    ownedElements: [
      // ===================== 1. CLASS DIAGRAM =====================
      {
        _type: "UMLModel",
        _id: classModelId,
        _parent: { $ref: projectId },
        name: "Modèle de Classes",
        ownedElements: [
          // --- Package Utilisateurs ---
          {
            _type: "UMLPackage",
            _id: generateId(),
            _parent: { $ref: classModelId },
            name: "Utilisateurs",
            ownedElements: [
              {
                _type: "UMLClass", _id: generateId(), name: "Utilisateur", isAbstract: true,
                attributes: [
                  attr("id", "UUID"), attr("nom", "String"), attr("prenom", "String"),
                  attr("email", "String"), attr("telephone", "String"),
                  attr("adresse", "String"), attr("avatarUrl", "String"), attr("role", "AppRole")
                ],
                operations: [op("authentifier"), op("gererProfil"), op("reinitialiserMotDePasse")]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "Patient",
                attributes: [
                  attr("dateNaissance", "Date"), attr("sexe", "String"), attr("groupeSanguin", "String"),
                  attr("allergies", "String[]"), attr("antecedentsMedicaux", "JSON"),
                  attr("beneficiaires", "JSON"), attr("estActif", "Boolean"), attr("numeroTelephone", "String")
                ],
                operations: [
                  op("prendreRendezVous"), op("consulterDossierMedical"), op("payerConsultation"),
                  op("recevoirRappelsSMS"), op("annulerRendezVous"), op("reprogrammerRendezVous"),
                  op("noterMedecin"), op("telechargerFacturePDF"), op("utiliserChatbotIA"),
                  op("creerTicketSupport"), op("envoyerMessage")
                ]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "Medecin",
                attributes: [
                  attr("specialiteId", "UUID"), attr("numeroLicence", "String"),
                  attr("anneesExperience", "Number"), attr("estVerifie", "Boolean"),
                  attr("adresse", "String"), attr("latitude", "Decimal"), attr("longitude", "Decimal")
                ],
                operations: [
                  op("gererRendezVous"), op("creerOrdonnance"), op("teleconsultation"),
                  op("signerDocuments"), op("confirmerRendezVous"), op("consulterDossierPatient"),
                  op("gererDocuments"), op("consulterAnalytics"), op("gererDisponibilites")
                ]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "Administrateur",
                operations: [
                  op("gererUtilisateurs"), op("modererContenu"), op("consulterAnalytics"),
                  op("gererPaiements"), op("approuverMedecins"), op("rejeterMedecins"),
                  op("gererRappelsSMS"), op("configurerPolitiques"), op("gererSpecialites"),
                  op("gererFAQ"), op("gererPages"), op("envoyerNotificationsGlobales"),
                  op("consulterJournalAudit")
                ]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "RoleUtilisateur",
                attributes: [
                  attr("id", "UUID"), attr("userId", "UUID"), attr("role", "AppRole")
                ]
              }
            ]
          },
          // --- Package Rendez-vous ---
          {
            _type: "UMLPackage", _id: generateId(), _parent: { $ref: classModelId },
            name: "Rendez-vous",
            ownedElements: [
              {
                _type: "UMLClass", _id: generateId(), name: "RendezVous",
                attributes: [
                  attr("id", "UUID"), attr("medecinId", "UUID"), attr("patientId", "UUID"),
                  attr("date", "Date"), attr("heure", "Time"), attr("type", "String"),
                  attr("mode", "String"), attr("statut", "String"), attr("lieu", "String"),
                  attr("montantPaiement", "Decimal"), attr("statutPaiement", "String"),
                  attr("nombreReprogrammations", "Number"), attr("raisonAnnulation", "String"),
                  attr("typeAnnulation", "String"), attr("annulePar", "String"),
                  attr("raisonReprogrammation", "String"), attr("dateReprogrammation", "DateTime"),
                  attr("datePrecedente", "Date"), attr("heurePrecedente", "Time")
                ],
                operations: [
                  op("reprogrammer"), op("annuler"), op("confirmer"),
                  op("terminer"), op("marquerAbsent"), op("programmerRappelSMS")
                ]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "DemandeApplicationMedecin",
                attributes: [
                  attr("id", "UUID"), attr("email", "String"), attr("prenom", "String"),
                  attr("nom", "String"), attr("specialiteId", "UUID"), attr("numeroLicence", "String"),
                  attr("urlDiplome", "String"), attr("urlLicence", "String"),
                  attr("autresDocuments", "String[]"), attr("statut", "String"),
                  attr("raisonRejet", "String"), attr("anneesExperience", "Number")
                ],
                operations: [op("approuver"), op("rejeter")]
              }
            ]
          },
          // --- Package Médical ---
          {
            _type: "UMLPackage", _id: generateId(), _parent: { $ref: classModelId },
            name: "Medical",
            ownedElements: [
              {
                _type: "UMLClass", _id: generateId(), name: "DossierMedical",
                attributes: [
                  attr("id", "UUID"), attr("patientId", "UUID"), attr("medecinId", "UUID"),
                  attr("diagnostic", "String"), attr("prescription", "String"),
                  attr("notes", "String"), attr("date", "Date")
                ]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "Document",
                attributes: [
                  attr("id", "UUID"), attr("patientId", "UUID"), attr("medecinId", "UUID"),
                  attr("titre", "String"), attr("type", "String"), attr("urlFichier", "String"),
                  attr("tailleFichier", "Number"), attr("estSigne", "Boolean"),
                  attr("urlSignature", "String"), attr("signeLe", "DateTime")
                ],
                operations: [op("signer"), op("telecharger"), op("partager")]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "ResultatLabo",
                attributes: [
                  attr("id", "UUID"), attr("patientId", "UUID"), attr("medecinId", "UUID"),
                  attr("nomTest", "String"), attr("dateTest", "Date"),
                  attr("resultats", "String"), attr("urlFichier", "String"), attr("notes", "String")
                ]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "ImageMedicale",
                attributes: [
                  attr("id", "UUID"), attr("patientId", "UUID"), attr("medecinId", "UUID"),
                  attr("typeImage", "String"), attr("urlImage", "String"),
                  attr("dateImage", "Date"), attr("description", "String"), attr("notes", "String")
                ]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "Vaccination",
                attributes: [
                  attr("id", "UUID"), attr("patientId", "UUID"), attr("nomVaccin", "String"),
                  attr("dateVaccination", "Date"), attr("prochaineDose", "Date"),
                  attr("administrePar", "String"), attr("notes", "String")
                ]
              }
            ]
          },
          // --- Package Paiements ---
          {
            _type: "UMLPackage", _id: generateId(), _parent: { $ref: classModelId },
            name: "Paiements",
            ownedElements: [
              {
                _type: "UMLClass", _id: generateId(), name: "Facture",
                attributes: [
                  attr("id", "UUID"), attr("rendezVousId", "UUID"),
                  attr("patientId", "UUID"), attr("medecinId", "UUID"),
                  attr("montant", "Decimal"), attr("statutPaiement", "String"),
                  attr("methodePaiement", "String"), attr("numeroFacture", "String"),
                  attr("datePaiement", "DateTime")
                ],
                operations: [op("genererPDF"), op("envoyer")]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "Evaluation",
                attributes: [
                  attr("id", "UUID"), attr("patientId", "UUID"), attr("medecinId", "UUID"),
                  attr("rendezVousId", "UUID"), attr("note", "Number"), attr("commentaire", "String")
                ]
              }
            ]
          },
          // --- Package Notifications ---
          {
            _type: "UMLPackage", _id: generateId(), _parent: { $ref: classModelId },
            name: "Notifications",
            ownedElements: [
              {
                _type: "UMLClass", _id: generateId(), name: "Notification",
                attributes: [
                  attr("id", "UUID"), attr("utilisateurId", "UUID"), attr("type", "String"),
                  attr("titre", "String"), attr("message", "String"), attr("priorite", "String"),
                  attr("estLue", "Boolean"), attr("rendezVousId", "UUID"), attr("metadata", "JSON")
                ],
                operations: [op("marquerCommeLue"), op("envoyer")]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "Rappel",
                attributes: [
                  attr("id", "UUID"), attr("rendezVousId", "UUID"), attr("patientId", "UUID"),
                  attr("programmePour", "DateTime"), attr("typeRappel", "String"),
                  attr("methode", "String"), attr("tentatives", "Number"), attr("statut", "String")
                ],
                operations: [op("programmer"), op("executer"), op("annuler")]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "LogSMS",
                attributes: [
                  attr("id", "UUID"), attr("utilisateurId", "UUID"),
                  attr("numeroTelephone", "String"), attr("message", "String"),
                  attr("statut", "String"), attr("reponseFournisseur", "JSON"),
                  attr("envoyeLe", "DateTime")
                ]
              }
            ]
          },
          // --- Package Administration ---
          {
            _type: "UMLPackage", _id: generateId(), _parent: { $ref: classModelId },
            name: "Administration",
            ownedElements: [
              {
                _type: "UMLClass", _id: generateId(), name: "Specialite",
                attributes: [
                  attr("id", "UUID"), attr("nom", "String"), attr("description", "String"),
                  attr("totalMedecins", "Number"), attr("statut", "String")
                ]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "FileAttente",
                attributes: [
                  attr("id", "UUID"), attr("patientId", "UUID"), attr("specialiteId", "UUID"),
                  attr("medecinDemandeId", "UUID"), attr("urgence", "String"),
                  attr("statut", "String"), attr("datesPreferees", "Date[]"), attr("notes", "String")
                ],
                operations: [op("assignerCreneau"), op("contacterPatient")]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "PolitiqueAnnulation",
                attributes: [
                  attr("id", "UUID"), attr("typeUtilisateur", "String"),
                  attr("heuresMinimumAvant", "Number")
                ]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "PolitiqueReprogrammation",
                attributes: [
                  attr("id", "UUID"), attr("heuresAvantRendezVous", "Number"),
                  attr("pourcentagePenalite", "Decimal"), attr("maxReprogrammations", "Number")
                ]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "TicketSupport",
                attributes: [
                  attr("id", "UUID"), attr("utilisateurId", "UUID"), attr("sujet", "String"),
                  attr("description", "String"), attr("categorie", "String"),
                  attr("statut", "String"), attr("priorite", "String"),
                  attr("assigneA", "UUID"), attr("resoluLe", "DateTime")
                ],
                operations: [op("resoudre"), op("assigner")]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "RapportModeration",
                attributes: [
                  attr("id", "UUID"), attr("signaleurId", "UUID"), attr("signaleId", "UUID"),
                  attr("raison", "String"), attr("details", "String"),
                  attr("statut", "String"), attr("resoluPar", "UUID"), attr("resoluLe", "DateTime")
                ],
                operations: [op("resoudre"), op("rejeter")]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "JournalAudit",
                attributes: [
                  attr("id", "UUID"), attr("adminId", "UUID"), attr("actionType", "String"),
                  attr("nomTable", "String"), attr("enregistrementId", "UUID"),
                  attr("details", "JSON"), attr("adresseIP", "String")
                ]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "MetriquesAdmin",
                attributes: [
                  attr("id", "UUID"), attr("nom", "String"), attr("valeur", "Number"),
                  attr("categorie", "String"), attr("periode", "String")
                ]
              }
            ]
          },
          // --- Package Messages & Contenu ---
          {
            _type: "UMLPackage", _id: generateId(), _parent: { $ref: classModelId },
            name: "Messages et Contenu",
            ownedElements: [
              {
                _type: "UMLClass", _id: generateId(), name: "Message",
                attributes: [
                  attr("id", "UUID"), attr("expediteurId", "UUID"), attr("destinataireId", "UUID"),
                  attr("sujet", "String"), attr("contenu", "String"),
                  attr("estLu", "Boolean"), attr("rendezVousId", "UUID")
                ],
                operations: [op("envoyer"), op("marquerCommeLu")]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "Note",
                attributes: [
                  attr("id", "UUID"), attr("patientId", "UUID"), attr("medecinId", "UUID"),
                  attr("titre", "String"), attr("contenu", "String"), attr("date", "Date")
                ]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "FAQ",
                attributes: [
                  attr("id", "UUID"), attr("question", "String"), attr("reponse", "String"),
                  attr("categorie", "String"), attr("statut", "String"),
                  attr("ordreAffichage", "Number"), attr("creePar", "UUID")
                ]
              },
              {
                _type: "UMLClass", _id: generateId(), name: "Page",
                attributes: [
                  attr("id", "UUID"), attr("titre", "String"), attr("slug", "String"),
                  attr("contenu", "String"), attr("statut", "String"), attr("auteurId", "UUID")
                ]
              }
            ]
          }
        ]
      },
      // ===================== 2. USE CASE DIAGRAM =====================
      {
        _type: "UMLModel",
        _id: useCaseModelId,
        _parent: { $ref: projectId },
        name: "Cas d'Utilisation",
        ownedElements: [
          { _type: "UMLActor", _id: generateId(), name: "Patient" },
          { _type: "UMLActor", _id: generateId(), name: "Médecin" },
          { _type: "UMLActor", _id: generateId(), name: "Administrateur" },
          { _type: "UMLActor", _id: generateId(), name: "Système" },
          // Patient
          { _type: "UMLUseCase", _id: generateId(), name: "S'inscrire" },
          { _type: "UMLUseCase", _id: generateId(), name: "Se connecter" },
          { _type: "UMLUseCase", _id: generateId(), name: "Gérer profil" },
          { _type: "UMLUseCase", _id: generateId(), name: "Réinitialiser mot de passe" },
          { _type: "UMLUseCase", _id: generateId(), name: "Rechercher médecin" },
          { _type: "UMLUseCase", _id: generateId(), name: "Filtrer par spécialité" },
          { _type: "UMLUseCase", _id: generateId(), name: "Filtrer par localisation/proximité" },
          { _type: "UMLUseCase", _id: generateId(), name: "Voir disponibilités" },
          { _type: "UMLUseCase", _id: generateId(), name: "Prendre rendez-vous" },
          { _type: "UMLUseCase", _id: generateId(), name: "Renseigner infos médicales" },
          { _type: "UMLUseCase", _id: generateId(), name: "Payer consultation" },
          { _type: "UMLUseCase", _id: generateId(), name: "Payer via Wave" },
          { _type: "UMLUseCase", _id: generateId(), name: "Payer via Orange Money" },
          { _type: "UMLUseCase", _id: generateId(), name: "Payer via Free Money" },
          { _type: "UMLUseCase", _id: generateId(), name: "Payer par carte bancaire" },
          { _type: "UMLUseCase", _id: generateId(), name: "Consulter tickets RDV" },
          { _type: "UMLUseCase", _id: generateId(), name: "Télécharger ticket PDF" },
          { _type: "UMLUseCase", _id: generateId(), name: "Annuler rendez-vous" },
          { _type: "UMLUseCase", _id: generateId(), name: "Reprogrammer rendez-vous" },
          { _type: "UMLUseCase", _id: generateId(), name: "Recevoir rappels SMS" },
          { _type: "UMLUseCase", _id: generateId(), name: "Consulter dossier médical" },
          { _type: "UMLUseCase", _id: generateId(), name: "Voir ordonnances" },
          { _type: "UMLUseCase", _id: generateId(), name: "Télécharger ordonnance PDF" },
          { _type: "UMLUseCase", _id: generateId(), name: "Voir résultats labo" },
          { _type: "UMLUseCase", _id: generateId(), name: "Voir imagerie médicale" },
          { _type: "UMLUseCase", _id: generateId(), name: "Voir vaccinations" },
          { _type: "UMLUseCase", _id: generateId(), name: "Consulter historique consultations" },
          { _type: "UMLUseCase", _id: generateId(), name: "Recevoir notifications" },
          { _type: "UMLUseCase", _id: generateId(), name: "Envoyer message médecin" },
          { _type: "UMLUseCase", _id: generateId(), name: "Utiliser chatbot IA" },
          { _type: "UMLUseCase", _id: generateId(), name: "Noter médecin" },
          { _type: "UMLUseCase", _id: generateId(), name: "Créer ticket support" },
          { _type: "UMLUseCase", _id: generateId(), name: "Consulter historique paiements" },
          { _type: "UMLUseCase", _id: generateId(), name: "Télécharger facture PDF" },
          // Médecin
          { _type: "UMLUseCase", _id: generateId(), name: "Postuler comme médecin" },
          { _type: "UMLUseCase", _id: generateId(), name: "Soumettre documents" },
          { _type: "UMLUseCase", _id: generateId(), name: "Gérer rendez-vous" },
          { _type: "UMLUseCase", _id: generateId(), name: "Voir infos patient avant RDV" },
          { _type: "UMLUseCase", _id: generateId(), name: "Confirmer rendez-vous" },
          { _type: "UMLUseCase", _id: generateId(), name: "Consulter dossier patient" },
          { _type: "UMLUseCase", _id: generateId(), name: "Créer dossier médical" },
          { _type: "UMLUseCase", _id: generateId(), name: "Rédiger ordonnance" },
          { _type: "UMLUseCase", _id: generateId(), name: "Signer document" },
          { _type: "UMLUseCase", _id: generateId(), name: "Gérer documents" },
          { _type: "UMLUseCase", _id: generateId(), name: "Faire téléconsultation" },
          { _type: "UMLUseCase", _id: generateId(), name: "Consulter analytics médecin" },
          { _type: "UMLUseCase", _id: generateId(), name: "Gérer disponibilités" },
          // Admin
          { _type: "UMLUseCase", _id: generateId(), name: "Gérer utilisateurs" },
          { _type: "UMLUseCase", _id: generateId(), name: "Approuver demandes médecins" },
          { _type: "UMLUseCase", _id: generateId(), name: "Rejeter demandes médecins" },
          { _type: "UMLUseCase", _id: generateId(), name: "Gérer spécialités" },
          { _type: "UMLUseCase", _id: generateId(), name: "Consulter analytics globales" },
          { _type: "UMLUseCase", _id: generateId(), name: "Gérer file d'attente" },
          { _type: "UMLUseCase", _id: generateId(), name: "Configurer rappels SMS" },
          { _type: "UMLUseCase", _id: generateId(), name: "Gérer politiques annulation" },
          { _type: "UMLUseCase", _id: generateId(), name: "Modérer rapports" },
          { _type: "UMLUseCase", _id: generateId(), name: "Superviser transactions" },
          { _type: "UMLUseCase", _id: generateId(), name: "Gérer contenu site (Pages)" },
          { _type: "UMLUseCase", _id: generateId(), name: "Gérer FAQ" },
          { _type: "UMLUseCase", _id: generateId(), name: "Envoyer notifications globales" },
          { _type: "UMLUseCase", _id: generateId(), name: "Consulter journal audit" },
          // Système
          { _type: "UMLUseCase", _id: generateId(), name: "Programmer rappels 24h" },
          { _type: "UMLUseCase", _id: generateId(), name: "Envoyer SMS automatiques" },
          { _type: "UMLUseCase", _id: generateId(), name: "Traiter paiements" },
          { _type: "UMLUseCase", _id: generateId(), name: "Générer notifications" },
          { _type: "UMLUseCase", _id: generateId(), name: "Calculer métriques" },
          { _type: "UMLUseCase", _id: generateId(), name: "Exécuter cron jobs" },
          { _type: "UMLUseCase", _id: generateId(), name: "Logger actions admin (audit)" }
        ]
      },
      // ===================== 3. STATE MACHINE =====================
      {
        _type: "UMLModel",
        _id: stateModelId,
        _parent: { $ref: projectId },
        name: "États Rendez-vous",
        ownedElements: [
          {
            _type: "UMLStateMachine", _id: generateId(),
            name: "Cycle de Vie Rendez-vous",
            regions: [{
              _type: "UMLRegion", _id: generateId(),
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
            }]
          }
        ]
      },
      // ===================== 4. ACTIVITY DIAGRAM =====================
      {
        _type: "UMLModel",
        _id: activityModelId,
        _parent: { $ref: projectId },
        name: "Processus Consultation",
        ownedElements: [{
          _type: "UMLActivity", _id: generateId(),
          name: "Processus Complet Consultation",
          nodes: [
            { _type: "UMLInitialNode", _id: generateId(), name: "Début" },
            { _type: "UMLAction", _id: generateId(), name: "Rechercher médecin" },
            { _type: "UMLAction", _id: generateId(), name: "Filtrer résultats (spécialité/localisation)" },
            { _type: "UMLDecisionNode", _id: generateId(), name: "Créneaux disponibles?" },
            { _type: "UMLAction", _id: generateId(), name: "Sélectionner créneau" },
            { _type: "UMLAction", _id: generateId(), name: "Choisir mode (cabinet/domicile/téléconsultation)" },
            { _type: "UMLAction", _id: generateId(), name: "Renseigner infos médicales" },
            { _type: "UMLAction", _id: generateId(), name: "Choisir méthode paiement" },
            { _type: "UMLForkNode", _id: generateId(), name: "Fork Paiement" },
            { _type: "UMLAction", _id: generateId(), name: "Wave" },
            { _type: "UMLAction", _id: generateId(), name: "Orange Money" },
            { _type: "UMLAction", _id: generateId(), name: "Free Money" },
            { _type: "UMLAction", _id: generateId(), name: "Carte Bancaire" },
            { _type: "UMLJoinNode", _id: generateId(), name: "Join Paiement" },
            { _type: "UMLDecisionNode", _id: generateId(), name: "Paiement réussi?" },
            { _type: "UMLAction", _id: generateId(), name: "Créer rendez-vous" },
            { _type: "UMLAction", _id: generateId(), name: "Générer ticket RDV" },
            { _type: "UMLAction", _id: generateId(), name: "Programmer rappel SMS 24h" },
            { _type: "UMLAction", _id: generateId(), name: "Envoyer notification médecin" },
            { _type: "UMLAction", _id: generateId(), name: "Médecin confirme RDV" },
            { _type: "UMLAction", _id: generateId(), name: "Envoyer SMS confirmation patient" },
            { _type: "UMLAction", _id: generateId(), name: "Rappel 24h avant" },
            { _type: "UMLDecisionNode", _id: generateId(), name: "Patient présent?" },
            { _type: "UMLAction", _id: generateId(), name: "Consultation (cabinet/téléconsultation)" },
            { _type: "UMLAction", _id: generateId(), name: "Créer dossier médical" },
            { _type: "UMLAction", _id: generateId(), name: "Rédiger ordonnance" },
            { _type: "UMLAction", _id: generateId(), name: "Signer documents" },
            { _type: "UMLAction", _id: generateId(), name: "Générer facture PDF" },
            { _type: "UMLAction", _id: generateId(), name: "Patient note médecin" },
            { _type: "UMLAction", _id: generateId(), name: "Marquer absent (no-show)" },
            { _type: "UMLActivityFinalNode", _id: generateId(), name: "Fin" }
          ]
        }]
      },
      // ===================== 5. SEQUENCE DIAGRAMS =====================
      {
        _type: "UMLModel",
        _id: sequenceModelId,
        _parent: { $ref: projectId },
        name: "Diagrammes de Séquence",
        ownedElements: [
          {
            _type: "UMLCollaboration", _id: generateId(), name: "Prise de Rendez-vous",
            ownedElements: [{
              _type: "UMLInteraction", _id: generateId(),
              name: "Séquence Rendez-vous Complet avec SMS",
              participants: [
                { _type: "UMLLifeline", _id: generateId(), name: "Patient" },
                { _type: "UMLLifeline", _id: generateId(), name: "Interface Web (React)" },
                { _type: "UMLLifeline", _id: generateId(), name: "Supabase Backend" },
                { _type: "UMLLifeline", _id: generateId(), name: "Base de Données PostgreSQL" },
                { _type: "UMLLifeline", _id: generateId(), name: "Edge Function secure-paytech" },
                { _type: "UMLLifeline", _id: generateId(), name: "PayTech API" },
                { _type: "UMLLifeline", _id: generateId(), name: "Edge Function send-sms" },
                { _type: "UMLLifeline", _id: generateId(), name: "Dexchange SMS API" },
                { _type: "UMLLifeline", _id: generateId(), name: "Edge Function process-reminders" },
                { _type: "UMLLifeline", _id: generateId(), name: "Notifications Realtime" },
                { _type: "UMLLifeline", _id: generateId(), name: "Médecin" }
              ]
            }]
          },
          {
            _type: "UMLCollaboration", _id: generateId(), name: "Approbation Médecin",
            ownedElements: [{
              _type: "UMLInteraction", _id: generateId(),
              name: "Workflow Approbation Médecin",
              participants: [
                { _type: "UMLLifeline", _id: generateId(), name: "Candidat Médecin" },
                { _type: "UMLLifeline", _id: generateId(), name: "Interface Web" },
                { _type: "UMLLifeline", _id: generateId(), name: "Supabase Backend" },
                { _type: "UMLLifeline", _id: generateId(), name: "Base de Données" },
                { _type: "UMLLifeline", _id: generateId(), name: "Supabase Storage" },
                { _type: "UMLLifeline", _id: generateId(), name: "Edge Function approve-doctor" },
                { _type: "UMLLifeline", _id: generateId(), name: "Resend Email" },
                { _type: "UMLLifeline", _id: generateId(), name: "Administrateur" }
              ]
            }]
          },
          {
            _type: "UMLCollaboration", _id: generateId(), name: "Paiement PayTech",
            ownedElements: [{
              _type: "UMLInteraction", _id: generateId(),
              name: "Paiement Multi-Méthodes (Wave/OM/Free/CB)",
              participants: [
                { _type: "UMLLifeline", _id: generateId(), name: "Patient" },
                { _type: "UMLLifeline", _id: generateId(), name: "Interface Web" },
                { _type: "UMLLifeline", _id: generateId(), name: "Supabase Backend" },
                { _type: "UMLLifeline", _id: generateId(), name: "Edge Function secure-paytech" },
                { _type: "UMLLifeline", _id: generateId(), name: "Rate Limiter" },
                { _type: "UMLLifeline", _id: generateId(), name: "PayTech API" },
                { _type: "UMLLifeline", _id: generateId(), name: "Edge Function verify-payment" },
                { _type: "UMLLifeline", _id: generateId(), name: "Base de Données" },
                { _type: "UMLLifeline", _id: generateId(), name: "Notifications" }
              ]
            }]
          },
          {
            _type: "UMLCollaboration", _id: generateId(), name: "Téléconsultation",
            ownedElements: [{
              _type: "UMLInteraction", _id: generateId(),
              name: "Flux Téléconsultation Vidéo",
              participants: [
                { _type: "UMLLifeline", _id: generateId(), name: "Patient" },
                { _type: "UMLLifeline", _id: generateId(), name: "Interface Patient" },
                { _type: "UMLLifeline", _id: generateId(), name: "Supabase Backend" },
                { _type: "UMLLifeline", _id: generateId(), name: "PeerJS (WebRTC)" },
                { _type: "UMLLifeline", _id: generateId(), name: "Base de Données" },
                { _type: "UMLLifeline", _id: generateId(), name: "Edge Function consultation-summary" },
                { _type: "UMLLifeline", _id: generateId(), name: "Notifications" },
                { _type: "UMLLifeline", _id: generateId(), name: "Interface Médecin" },
                { _type: "UMLLifeline", _id: generateId(), name: "Médecin" }
              ]
            }]
          },
          {
            _type: "UMLCollaboration", _id: generateId(), name: "Administration",
            ownedElements: [{
              _type: "UMLInteraction", _id: generateId(),
              name: "Séquence Actions Admin avec Audit",
              participants: [
                { _type: "UMLLifeline", _id: generateId(), name: "Administrateur" },
                { _type: "UMLLifeline", _id: generateId(), name: "Interface Admin" },
                { _type: "UMLLifeline", _id: generateId(), name: "Supabase Backend" },
                { _type: "UMLLifeline", _id: generateId(), name: "RLS / has_role()" },
                { _type: "UMLLifeline", _id: generateId(), name: "Base de Données" },
                { _type: "UMLLifeline", _id: generateId(), name: "admin_audit_logs" },
                { _type: "UMLLifeline", _id: generateId(), name: "Edge Function admin-manage-users" }
              ]
            }]
          }
        ]
      },
      // ===================== 6. ERD — 27 TABLES =====================
      {
        _type: "UMLModel",
        _id: erdModelId,
        _parent: { $ref: projectId },
        name: "Schéma Base de Données (27 tables)",
        ownedElements: [{
          _type: "ERDDataModel", _id: generateId(),
          name: "Supabase PostgreSQL Schema",
          ownedElements: [
            erdEntity("profiles", [
              { name: "id", type: "UUID", pk: true },
              { name: "first_name", type: "TEXT" }, { name: "last_name", type: "TEXT" },
              { name: "email", type: "TEXT" }, { name: "phone_number", type: "TEXT" },
              { name: "address", type: "TEXT" }, { name: "avatar_url", type: "TEXT" }
            ]),
            erdEntity("patients", [
              { name: "id", type: "UUID", pk: true, fk: true },
              { name: "birth_date", type: "DATE" }, { name: "gender", type: "TEXT" },
              { name: "blood_type", type: "TEXT" }, { name: "allergies", type: "TEXT[]" },
              { name: "medical_history", type: "JSONB" }, { name: "beneficiaries", type: "JSONB" },
              { name: "is_active", type: "BOOLEAN" }, { name: "phone_number", type: "TEXT" },
              { name: "medical_record_id", type: "TEXT" }
            ]),
            erdEntity("doctors", [
              { name: "id", type: "UUID", pk: true, fk: true },
              { name: "specialty_id", type: "UUID", fk: true },
              { name: "license_number", type: "TEXT" }, { name: "is_verified", type: "BOOLEAN" },
              { name: "years_of_experience", type: "INTEGER" },
              { name: "address", type: "TEXT" }, { name: "latitude", type: "DECIMAL" },
              { name: "longitude", type: "DECIMAL" }
            ]),
            erdEntity("user_roles", [
              { name: "id", type: "UUID", pk: true },
              { name: "user_id", type: "UUID", fk: true },
              { name: "role", type: "app_role ENUM" }
            ]),
            erdEntity("appointments", [
              { name: "id", type: "UUID", pk: true },
              { name: "doctor_id", type: "UUID", fk: true },
              { name: "patient_id", type: "UUID", fk: true },
              { name: "date", type: "DATE" }, { name: "time", type: "TIME" },
              { name: "type", type: "TEXT" }, { name: "mode", type: "TEXT" },
              { name: "status", type: "TEXT" }, { name: "location", type: "TEXT" },
              { name: "payment_amount", type: "DECIMAL" }, { name: "payment_status", type: "TEXT" },
              { name: "payment_id", type: "TEXT" }, { name: "notes", type: "TEXT" },
              { name: "cancellation_reason", type: "TEXT" }, { name: "cancellation_type", type: "TEXT" },
              { name: "cancelled_by", type: "UUID" }, { name: "reschedule_count", type: "INTEGER" },
              { name: "reschedule_reason", type: "TEXT" }
            ]),
            erdEntity("doctor_applications", [
              { name: "id", type: "UUID", pk: true },
              { name: "email", type: "TEXT" }, { name: "first_name", type: "TEXT" },
              { name: "last_name", type: "TEXT" }, { name: "specialty_id", type: "UUID", fk: true },
              { name: "license_number", type: "TEXT" }, { name: "diploma_url", type: "TEXT" },
              { name: "license_url", type: "TEXT" }, { name: "status", type: "TEXT" },
              { name: "rejection_reason", type: "TEXT" }, { name: "years_of_experience", type: "INTEGER" }
            ]),
            erdEntity("specialties", [
              { name: "id", type: "UUID", pk: true },
              { name: "name", type: "TEXT" }, { name: "description", type: "TEXT" },
              { name: "status", type: "TEXT" }, { name: "total_doctors", type: "INTEGER" }
            ]),
            erdEntity("medical_records", [
              { name: "id", type: "UUID", pk: true },
              { name: "patient_id", type: "UUID", fk: true },
              { name: "doctor_id", type: "UUID", fk: true },
              { name: "date", type: "DATE" }, { name: "diagnosis", type: "TEXT" },
              { name: "prescription", type: "TEXT" }, { name: "notes", type: "TEXT" }
            ]),
            erdEntity("documents", [
              { name: "id", type: "UUID", pk: true },
              { name: "patient_id", type: "UUID", fk: true },
              { name: "doctor_id", type: "UUID", fk: true },
              { name: "title", type: "TEXT" }, { name: "type", type: "TEXT" },
              { name: "file_url", type: "TEXT" }, { name: "file_size", type: "INTEGER" },
              { name: "is_signed", type: "BOOLEAN" }, { name: "signature_url", type: "TEXT" }
            ]),
            erdEntity("lab_results", [
              { name: "id", type: "UUID", pk: true },
              { name: "patient_id", type: "UUID", fk: true },
              { name: "doctor_id", type: "UUID", fk: true },
              { name: "test_name", type: "TEXT" }, { name: "test_date", type: "DATE" },
              { name: "results", type: "TEXT" }, { name: "file_url", type: "TEXT" }
            ]),
            erdEntity("medical_images", [
              { name: "id", type: "UUID", pk: true },
              { name: "patient_id", type: "UUID", fk: true },
              { name: "doctor_id", type: "UUID", fk: true },
              { name: "image_type", type: "TEXT" }, { name: "image_url", type: "TEXT" },
              { name: "image_date", type: "DATE" }, { name: "description", type: "TEXT" }
            ]),
            erdEntity("vaccinations", [
              { name: "id", type: "UUID", pk: true },
              { name: "patient_id", type: "UUID", fk: true },
              { name: "vaccine_name", type: "TEXT" }, { name: "vaccination_date", type: "DATE" },
              { name: "next_dose_date", type: "DATE" }, { name: "administered_by", type: "TEXT" }
            ]),
            erdEntity("invoices", [
              { name: "id", type: "UUID", pk: true },
              { name: "appointment_id", type: "UUID", fk: true },
              { name: "patient_id", type: "UUID", fk: true },
              { name: "doctor_id", type: "UUID", fk: true },
              { name: "amount", type: "DECIMAL" }, { name: "payment_status", type: "TEXT" },
              { name: "payment_method", type: "TEXT" }, { name: "invoice_number", type: "TEXT" }
            ]),
            erdEntity("ratings", [
              { name: "id", type: "UUID", pk: true },
              { name: "patient_id", type: "UUID", fk: true },
              { name: "doctor_id", type: "UUID", fk: true },
              { name: "appointment_id", type: "UUID", fk: true },
              { name: "rating", type: "INTEGER" }, { name: "comment", type: "TEXT" }
            ]),
            erdEntity("notifications", [
              { name: "id", type: "UUID", pk: true },
              { name: "user_id", type: "UUID", fk: true },
              { name: "type", type: "TEXT" }, { name: "title", type: "TEXT" },
              { name: "message", type: "TEXT" }, { name: "priority", type: "TEXT" },
              { name: "is_read", type: "BOOLEAN" }, { name: "appointment_id", type: "UUID", fk: true },
              { name: "metadata", type: "JSONB" }
            ]),
            erdEntity("reminders", [
              { name: "id", type: "UUID", pk: true },
              { name: "appointment_id", type: "UUID", fk: true },
              { name: "patient_id", type: "UUID", fk: true },
              { name: "scheduled_for", type: "TIMESTAMP" }, { name: "reminder_type", type: "TEXT" },
              { name: "method", type: "TEXT" }, { name: "attempts", type: "INTEGER" },
              { name: "status", type: "TEXT" }
            ]),
            erdEntity("sms_logs", [
              { name: "id", type: "UUID", pk: true },
              { name: "user_id", type: "UUID", fk: true },
              { name: "phone_number", type: "TEXT" }, { name: "message", type: "TEXT" },
              { name: "status", type: "TEXT" }, { name: "provider_response", type: "JSONB" },
              { name: "sent_at", type: "TIMESTAMP" }
            ]),
            erdEntity("messages", [
              { name: "id", type: "UUID", pk: true },
              { name: "sender_id", type: "UUID", fk: true },
              { name: "receiver_id", type: "UUID", fk: true },
              { name: "subject", type: "TEXT" }, { name: "content", type: "TEXT" },
              { name: "is_read", type: "BOOLEAN" }, { name: "appointment_id", type: "UUID", fk: true }
            ]),
            erdEntity("notes", [
              { name: "id", type: "UUID", pk: true },
              { name: "patient_id", type: "UUID", fk: true },
              { name: "doctor_id", type: "UUID", fk: true },
              { name: "title", type: "TEXT" }, { name: "content", type: "TEXT" },
              { name: "date", type: "DATE" }
            ]),
            erdEntity("support_tickets", [
              { name: "id", type: "UUID", pk: true },
              { name: "user_id", type: "UUID", fk: true },
              { name: "subject", type: "TEXT" }, { name: "description", type: "TEXT" },
              { name: "category", type: "TEXT" }, { name: "status", type: "TEXT" },
              { name: "priority", type: "TEXT" }, { name: "assigned_to", type: "UUID", fk: true }
            ]),
            erdEntity("moderation_reports", [
              { name: "id", type: "UUID", pk: true },
              { name: "reporter_id", type: "UUID", fk: true },
              { name: "reported_id", type: "UUID", fk: true },
              { name: "reason", type: "TEXT" }, { name: "details", type: "TEXT" },
              { name: "status", type: "TEXT" }, { name: "resolved_by", type: "UUID", fk: true }
            ]),
            erdEntity("queue_entries", [
              { name: "id", type: "UUID", pk: true },
              { name: "patient_id", type: "UUID", fk: true },
              { name: "specialty_id", type: "UUID", fk: true },
              { name: "requested_doctor_id", type: "UUID", fk: true },
              { name: "urgency", type: "TEXT" }, { name: "status", type: "TEXT" },
              { name: "preferred_dates", type: "DATE[]" }, { name: "notes", type: "TEXT" }
            ]),
            erdEntity("cancellation_policies", [
              { name: "id", type: "UUID", pk: true },
              { name: "user_type", type: "TEXT" },
              { name: "minimum_hours_before", type: "INTEGER" }
            ]),
            erdEntity("reschedule_policies", [
              { name: "id", type: "UUID", pk: true },
              { name: "hours_before_appointment", type: "INTEGER" },
              { name: "max_reschedules", type: "INTEGER" },
              { name: "penalty_percentage", type: "DECIMAL" }
            ]),
            erdEntity("admin_audit_logs", [
              { name: "id", type: "UUID", pk: true },
              { name: "admin_id", type: "UUID", fk: true },
              { name: "action_type", type: "TEXT" }, { name: "table_name", type: "TEXT" },
              { name: "record_id", type: "UUID" }, { name: "details", type: "JSONB" },
              { name: "ip_address", type: "TEXT" }
            ]),
            erdEntity("admin_metrics", [
              { name: "id", type: "UUID", pk: true },
              { name: "name", type: "TEXT" }, { name: "value", type: "DECIMAL" },
              { name: "category", type: "TEXT" }, { name: "period", type: "TEXT" }
            ]),
            erdEntity("faqs", [
              { name: "id", type: "UUID", pk: true },
              { name: "question", type: "TEXT" }, { name: "answer", type: "TEXT" },
              { name: "category", type: "TEXT" }, { name: "status", type: "TEXT" },
              { name: "sort_order", type: "INTEGER" }, { name: "created_by", type: "UUID", fk: true }
            ]),
            erdEntity("pages", [
              { name: "id", type: "UUID", pk: true },
              { name: "title", type: "TEXT" }, { name: "slug", type: "TEXT" },
              { name: "content", type: "TEXT" }, { name: "status", type: "TEXT" },
              { name: "author_id", type: "UUID", fk: true }
            ])
          ]
        }]
      },
      // ===================== 7. DEPLOYMENT DIAGRAM =====================
      {
        _type: "UMLModel",
        _id: deploymentModelId,
        _parent: { $ref: projectId },
        name: "Architecture de Déploiement",
        ownedElements: [
          {
            _type: "UMLNode", _id: generateId(), name: "Client (Navigateur/PWA)",
            ownedElements: [
              { _type: "UMLComponent", _id: generateId(), name: "React 18 + Vite + TypeScript" },
              { _type: "UMLComponent", _id: generateId(), name: "Tailwind CSS + shadcn/ui" },
              { _type: "UMLComponent", _id: generateId(), name: "React Query (TanStack)" },
              { _type: "UMLComponent", _id: generateId(), name: "React Router v6" },
              { _type: "UMLComponent", _id: generateId(), name: "Service Worker (PWA)" },
              { _type: "UMLComponent", _id: generateId(), name: "PeerJS (WebRTC)" },
              { _type: "UMLComponent", _id: generateId(), name: "Mermaid.js (diagrammes)" },
              { _type: "UMLComponent", _id: generateId(), name: "Leaflet (cartes)" }
            ]
          },
          {
            _type: "UMLNode", _id: generateId(), name: "Supabase Cloud",
            ownedElements: [
              {
                _type: "UMLNode", _id: generateId(), name: "Authentication (GoTrue)",
                ownedElements: [
                  { _type: "UMLComponent", _id: generateId(), name: "Email/Password Auth" },
                  { _type: "UMLComponent", _id: generateId(), name: "JWT Tokens" },
                  { _type: "UMLComponent", _id: generateId(), name: "Row Level Security (RLS)" }
                ]
              },
              {
                _type: "UMLNode", _id: generateId(), name: "PostgreSQL Database",
                ownedElements: [
                  { _type: "UMLComponent", _id: generateId(), name: "27 Tables" },
                  { _type: "UMLComponent", _id: generateId(), name: "RLS Policies" },
                  { _type: "UMLComponent", _id: generateId(), name: "Functions: has_role(), is_admin(), get_safe_profile()" },
                  { _type: "UMLComponent", _id: generateId(), name: "Enums: app_role (admin, doctor, patient)" },
                  { _type: "UMLComponent", _id: generateId(), name: "Realtime Subscriptions" }
                ]
              },
              {
                _type: "UMLNode", _id: generateId(), name: "Edge Functions (Deno)",
                ownedElements: [
                  { _type: "UMLComponent", _id: generateId(), name: "secure-paytech" },
                  { _type: "UMLComponent", _id: generateId(), name: "secure-paytech-status" },
                  { _type: "UMLComponent", _id: generateId(), name: "verify-payment" },
                  { _type: "UMLComponent", _id: generateId(), name: "secure-payment" },
                  { _type: "UMLComponent", _id: generateId(), name: "send-sms" },
                  { _type: "UMLComponent", _id: generateId(), name: "process-reminders" },
                  { _type: "UMLComponent", _id: generateId(), name: "approve-doctor-application" },
                  { _type: "UMLComponent", _id: generateId(), name: "reject-doctor-application" },
                  { _type: "UMLComponent", _id: generateId(), name: "patient-chatbot" },
                  { _type: "UMLComponent", _id: generateId(), name: "consultation-summary" },
                  { _type: "UMLComponent", _id: generateId(), name: "admin-manage-users" },
                  { _type: "UMLComponent", _id: generateId(), name: "send-ticket-email" },
                  { _type: "UMLComponent", _id: generateId(), name: "share-prescription" },
                  { _type: "UMLComponent", _id: generateId(), name: "whatsapp-webhook" },
                  { _type: "UMLComponent", _id: generateId(), name: "Rate Limiter (_shared)" }
                ]
              },
              {
                _type: "UMLNode", _id: generateId(), name: "Supabase Storage",
                ownedElements: [
                  { _type: "UMLComponent", _id: generateId(), name: "Documents médicaux" },
                  { _type: "UMLComponent", _id: generateId(), name: "Diplômes / Licences" },
                  { _type: "UMLComponent", _id: generateId(), name: "Signatures numériques" },
                  { _type: "UMLComponent", _id: generateId(), name: "Avatars utilisateurs" }
                ]
              }
            ]
          },
          {
            _type: "UMLNode", _id: generateId(), name: "Services Externes",
            ownedElements: [
              { _type: "UMLComponent", _id: generateId(), name: "PayTech (Wave, OM, Free Money, CB)" },
              { _type: "UMLComponent", _id: generateId(), name: "Dexchange SMS API" },
              { _type: "UMLComponent", _id: generateId(), name: "Resend (Email transactionnel)" },
              { _type: "UMLComponent", _id: generateId(), name: "PeerJS Cloud (signaling WebRTC)" },
              { _type: "UMLComponent", _id: generateId(), name: "WhatsApp Business API" },
              { _type: "UMLComponent", _id: generateId(), name: "OpenStreetMap / Leaflet Tiles" }
            ]
          },
          {
            _type: "UMLNode", _id: generateId(), name: "Hébergement",
            ownedElements: [
              { _type: "UMLComponent", _id: generateId(), name: "Lovable Cloud (Frontend)" },
              { _type: "UMLComponent", _id: generateId(), name: "CDN avec HTTPS" },
              { _type: "UMLComponent", _id: generateId(), name: "Domaine: jammsante.lovable.app" }
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
