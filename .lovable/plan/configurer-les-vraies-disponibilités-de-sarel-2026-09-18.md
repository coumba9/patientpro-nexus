# Configurer les vraies disponibilités de SAREL

- Remplacer uniquement les horaires de SAREL par lundi, mercredi et samedi, de 9 h à 16 h, heure de Dakar.
- Rattacher ces horaires au cabinet existant à Keur Massar, sans inventer d’adresse précise ni modifier les rendez-vous déjà pris.
- Appliquer 30 minutes et 10 000 FCFA aux quatre motifs existants : première consultation, suivi, renouvellement d’ordonnance et urgence.
- Vérifier que la réservation affiche ces motifs, leurs tarifs et les créneaux réellement libres.

## Comptes et vérification

L’adresse fournie correspond déjà à un compte patient : le conserver sans changer son mot de passe ni lui attribuer le rôle administrateur.

Une adresse distincte sera nécessaire pour créer le compte administrateur de test. Ne pas créer de compte privilégié avec une adresse inventée.

Vérifier l’accès public à la réservation. La vérification complète avec connexion reste limitée : ce projet Supabase externe ne permet pas de récupérer une session de test automatiquement.

## Détails techniques

- Mettre à jour les données existantes avec une transaction, sans changement de schéma.
- Préserver les absences et réservations existantes.
- Vérifier la cohérence des prix affichés et de la validation du paiement avant de déclarer les tarifs utilisables.
