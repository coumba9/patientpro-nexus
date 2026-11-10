# Recentrer JàmmSanté sur la prise de rendez-vous

## Résultat attendu
Une application en français pour **JàmmSanté, Keur Massar**, destinée à un seul lieu. Le patient choisit une spécialité, une date et un créneau, sans choisir de médecin et sans payer à la réservation. Les écrans seront simples, utilisables sur téléphone, avec de grands boutons et des erreurs compréhensibles.

## État vérifié
- 6 profils utilisateurs, 2 fiches patient, 3 médecins et 5 spécialités.
- 31 rendez-vous : 27 terminés et 4 annulés ; tous leurs médecins ont une spécialité.
- 4 motifs de consultation et 1 lieu d’exercice.
- 1 dossier médical, 2 documents, 4 avis et 2 candidatures seront concernés par les suppressions ; 5 messages sont à conserver.
- Aucune table `cabinets` ni colonne `cabinet_id` dans la base actuelle. Le fonctionnement multi-lieux passe par `practice_locations`.
- Les comptes utilisent actuellement une adresse e-mail. Plusieurs accès et statistiques doivent être resserrés ; l’administration peut actuellement consulter trop de données.
- Les disponibilités actuelles sont hebdomadaires, contrairement aux plages datées demandées.

## Ce qui sera supprimé
- Recherche et choix de médecin, favoris, filtres géographiques, choix de lieu et cartes multi-lieux.
- Motifs de consultation, avis et modération des avis.
- Dossiers médicaux, ordonnances, documents et signatures, examens, imagerie, vaccinations, téléconsultation et résumés IA.
- Candidatures des médecins, justificatifs, approbation/rejet et leurs services.
- Gestion du contenu, chatbot et WhatsApp IA, tickets téléchargeables, historique des paiements patient et factures séparées.
- Pages, menus, routes, composants, services, fonctions et dépendances utilisés exclusivement par ces fonctionnalités. Les diagrammes existants seront adaptés au modèle simplifié, sans parcours médical obsolète.

**Suppression des données :** les dossiers, documents, avis et candidatures existants disparaîtront de l’application et de leurs tables. La suppression définitive sera présentée dans une migration distincte, après conservation des comptes, rendez-vous, messages et informations de paiement utiles. Aucun effacement n’a été effectué pendant cette analyse. Ne pas supprimer les anciennes migrations : elles constituent l’historique des changements.

## Parcours à construire
### Visiteur et patient
- Accueil centré sur les spécialités du cabinet, sans catalogue de médecins ni statistiques inventées.
- Inscription : nom, prénom, téléphone, identifiant, mot de passe, date de naissance, sexe, groupe sanguin et antécédents en texte libre.
- Identification sans e-mail réel ; adresses techniques invisibles. Les comptes existants conservent leur identité et leur mot de passe, avec une transition de leur identifiant sans les recréer.
- Réservation : spécialité → date → créneau → récapitulatif → demande enregistrée.
- Liste des rendez-vous et messages ; annulation ou reprogrammation jusqu’au délai autorisé, initialement 24 heures.
- En cas de créneau complet : refus explicite et actualisation des disponibilités.
- La récupération par e-mail ne fonctionnera pas pour les adresses techniques : proposer une réinitialisation encadrée par l’administrateur, sans afficher ni stocker les mots de passe en clair.

### Médecin
- Plages avec date/heure de début et de fin, durée des créneaux, génération automatique et blocage/libération.
- Rendez-vous de sa spécialité sur ses plages ; confirmation et passage à « terminé ».
- Informations nécessaires du patient uniquement pour ses rendez-vous : identité, téléphone, groupe sanguin et antécédents.
- Envoi de messages conservés dans l’espace du patient.
- Enregistrement de zéro à plusieurs paiements par rendez-vous : montant, espèces/mobile money/carte, statut, référence et numéro de facture.

### Administrateur
- Création, modification, blocage et suppression des médecins ; une spécialité par médecin, aucun recrutement public.
- Gestion des spécialités et du délai de modification des rendez-vous.
- États réels par statut, spécialité et période ; nombres de patients et médecins.
- Aucun accès aux antécédents ou autres données de soins, y compris via les anciennes fonctions d’export ou de profil.

## Conservation et migrations
1. Ajouter les identifiants uniques et statuts de compte, conserver les identités Auth, les rôles séparés et les mots de passe existants. Corriger le mécanisme d’inscription pour qu’aucun rôle privilégié ne dépende des informations modifiables par l’utilisateur.
2. Ajouter la spécialité aux rendez-vous et la renseigner depuis le médecin historique. Conserver les 31 rendez-vous et leurs statuts ; ne pas les recréer.
3. Introduire les plages datées et créneaux bloquables. Convertir les horaires hebdomadaires et indisponibilités existantes en explicitant leur période de validité avant de retirer les anciennes tables ; ne pas effacer les horaires de SAREL sans remplacement.
4. Introduire les paiements indépendants et transférer les montants/références existants sans inventer qu’ils ont été encaissés. La table `invoices` est vide ; le numéro de facture appartient désormais au paiement.
5. Installer les nouvelles règles et parcours, puis supprimer explicitement les tables, colonnes et fonctions obsolètes. Ne pas utiliser une suppression globale qui emporterait des objets non inventoriés.

## Détails techniques
- Conserver React/Vite et le système visuel teal/mint/coral existant ; services distincts pour réservation, messages, paiements et comptes.
- Utiliser Supabase Auth avec identifiant normalisé et adresse technique interne. Les anciens comptes doivent pouvoir s’identifier sans exposer leur e-mail par une recherche publique. L’inscription sans confirmation d’e-mail réel doit être gérée côté serveur pour ce Supabase externe ; ne pas modifier silencieusement les réglages globaux des anciens comptes.
- Garder `profiles`, `patients`, `doctors`, `user_roles`, `specialties`, `appointments`, `messages` et les réglages/audits nécessaires ; adapter les noms de colonnes existants plutôt que recréer toutes les identités.
- Un rendez-vous appartient à un patient et une spécialité. Toute affectation éventuelle à un médecin est interne, jamais choisie par le patient ; les données utiles ne sont accessibles qu’aux médecins concernés.
- Réservation et reprogrammation atomiques côté serveur, verrouillage de la capacité de la spécialité et du créneau, prise en compte des chevauchements et des médecins bloqués. Aucun simple contrôle de disponibilité dans le navigateur.
- Contrôle serveur du délai de modification ; audit des changements de comptes et rendez-vous. Les règles d’accès doivent aussi bloquer un compte avec une ancienne session encore ouverte.
- FORCE RLS sur toutes les tables conservées/nouvelles, droits explicites, rôles protégés. La liste publique des spécialités passe par un accès limité sans ouvrir les données personnelles aux visiteurs.
- PayTech isolé : aucun appel au paiement pendant une réservation, enregistrement manuel toujours disponible. Ne pas supprimer les clés existantes.
- Supprimer les fonctions distantes devenues inutiles et adapter les tâches planifiées qui dépendaient de l’ancien modèle, pas seulement leurs fichiers locaux.

## Vérifications avant de conclure
- Tests concrets : 24 h par défaut, réservation sans paiement, capacité égale aux médecins disponibles, refus concurrent d’un créneau plein, libération après annulation, plusieurs paiements, blocage de compte et audit.
- Vérifier les droits avec patient, médecin, administrateur et visiteur ; aucun accès administratif aux antécédents.
- Vérifier inscription sans e-mail → identification → réservation, puis confirmation et paiement médecin, et création/blocage d’un médecin par l’administrateur.
- Vérifier téléphone et ordinateur, liens supprimés et absence d’erreurs.
- Le Supabase externe ne fournit actuellement aucune session automatique pour tester les anciens comptes : ne pas déclarer ces parcours vérifiés sans connexion réelle. Les nouveaux parcours sans e-mail pourront être testés par inscription d’un compte de test lorsqu’ils seront disponibles.