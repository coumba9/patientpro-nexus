# Configuration WhatsApp pour JàmmSanté

## Prérequis

Vous devez avoir un compte WhatsApp Business et accès à l'API WhatsApp Business.

## Étapes de configuration

### 1. Obtenir les identifiants WhatsApp

Connectez-vous à votre compte Meta for Developers et récupérez :
- `WHATSAPP_ACCESS_TOKEN` : Token d'accès à l'API
- `WHATSAPP_VERIFY_TOKEN` : Token de vérification personnalisé (vous le créez)
- `WHATSAPP_PHONE_NUMBER_ID` : ID du numéro de téléphone WhatsApp Business

### 2. Configurer les secrets Supabase

Ajoutez ces trois secrets dans votre projet Supabase :

```bash
# Dans la console Supabase, allez dans Settings > Edge Functions > Secrets
WHATSAPP_ACCESS_TOKEN=votre_token_ici
WHATSAPP_VERIFY_TOKEN=votre_token_verification_ici
WHATSAPP_PHONE_NUMBER_ID=votre_phone_id_ici
```

### 3. Configurer le webhook WhatsApp

Dans la console Meta for Developers :

1. Allez dans votre application WhatsApp Business
2. Configurez le webhook avec l'URL :
   ```
   https://diieheagpzlqatqpzjua.supabase.co/functions/v1/whatsapp-webhook
   ```
3. Utilisez le même `WHATSAPP_VERIFY_TOKEN` que celui configuré dans Supabase
4. Abonnez-vous aux événements `messages`

## Test

Une fois configuré, envoyez un message WhatsApp au numéro configuré. Le bot devrait répondre automatiquement en utilisant l'IA pour aider avec les rendez-vous.

## Fonctionnalités

Le chatbot WhatsApp peut :
- Répondre aux questions sur les rendez-vous
- Aider à trouver des médecins
- Fournir des informations sur la plateforme JàmmSanté
- Assister avec les paiements et modes de consultation

Les réponses sont générées par l'IA et sont limitées à 300 caractères pour rester concises sur WhatsApp.
