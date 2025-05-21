
# API Layer Architecture

Cette couche API a été conçue pour structurer le code de manière à faciliter une migration future vers un backend NestJS si nécessaire, tout en utilisant Supabase comme backend actuel.

## Structure

```
api/
├── base/
│   └── base.service.ts         # Service de base avec méthodes CRUD communes
├── interfaces/
│   └── index.ts                # Définitions des types et interfaces
├── services/
│   ├── specialty.service.ts    # Service pour gérer les spécialités
│   ├── doctor.service.ts       # Service pour gérer les médecins
│   ├── patient.service.ts      # Service pour gérer les patients
│   ├── appointment.service.ts  # Service pour gérer les rendez-vous
│   ├── auth.service.ts         # Service pour l'authentification
│   └── medical-record.service.ts # Service pour les dossiers médicaux
└── index.ts                    # Point d'entrée pour exporter les services
```

## Utilisation

Exemple d'utilisation dans un composant React:

```typescript
import { specialtyService } from '@/api';

const MyComponent = () => {
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await specialtyService.getAll();
        setSpecialties(data);
      } catch (error) {
        console.error(error);
      }
    };
    
    fetchData();
  }, []);

  // reste du composant...
}
```

## Migration vers NestJS

Pour migrer vers NestJS à l'avenir:

1. Créer un projet NestJS séparé
2. Réutiliser les interfaces définies dans `interfaces/`
3. Implémenter des contrôleurs et services NestJS qui exposent la même API
4. Modifier les importations pour utiliser un client HTTP (Axios) au lieu des services directs

Les patterns de conception utilisés ici facilitent cette transition.
