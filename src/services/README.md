
# Architecture de l'API JàmmSanté

Ce répertoire contient une architecture modulaire qui facilite la migration vers un backend NestJS dans le futur.

## Structure actuelle

L'architecture est construite autour de services qui encapsulent les opérations d'accès aux données via Supabase, mais avec une structure qui reflète celle qu'on pourrait retrouver dans un backend NestJS.

### Principes clés

1. **Services modulaires**: Chaque entité dispose de son propre service qui implémente les opérations CRUD.
2. **Base Service**: Un service de base qui fournit des méthodes communes à tous les services.
3. **Interfaces typées**: Définition claire des types de données pour assurer la cohérence.

### Migration future vers NestJS

Pour migrer vers NestJS à l'avenir:

1. Créer un projet NestJS séparé
2. Importer les interfaces déjà définies
3. Développer des contrôleurs NestJS qui exposent les mêmes méthodes que nos services actuels
4. Mettre à jour les points d'accès dans l'application React pour utiliser les API NestJS au lieu des services directs

Les fichiers `src/api/interfaces` pourront être utilisés directement dans NestJS.
