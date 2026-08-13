/**
 * Utilitaires de recherche partagés (accents, pluriels, tolérance de saisie).
 * Utilisés par toutes les barres de recherche de la plateforme.
 */

/** Normalise une chaîne : minuscules, sans accents, sans ponctuation. */
export const normalizeText = (value: string): string =>
  (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Longueur du préfixe commun entre deux mots. */
const commonPrefixLength = (a: string, b: string): number => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
};

/**
 * Un terme correspond-il à l'un des mots du texte ?
 * Tolère les variantes de fin de mot : "generale" ↔ "generaliste", "medecins" ↔ "medecin".
 */
const tokenMatches = (token: string, words: string[]): boolean =>
  words.some((word) => {
    if (word.startsWith(token) || token.startsWith(word)) return true;
    const shared = commonPrefixLength(word, token);
    return shared >= 5 || (shared >= 4 && shared === Math.min(word.length, token.length));
  });

/**
 * Vérifie qu'une requête correspond à un ensemble de champs.
 * Tous les mots saisis doivent correspondre (recherche ET).
 */
export const matchesSearch = (query: string, ...fields: (string | null | undefined)[]): boolean => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return true;

  const haystack = normalizeText(fields.filter(Boolean).join(" "));
  if (!haystack) return false;

  const words = haystack.split(" ");
  return normalizedQuery.split(" ").every((token) => tokenMatches(token, words));
};
