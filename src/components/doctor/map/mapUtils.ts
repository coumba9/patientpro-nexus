
/**
 * Obtient les coordonnées géographiques à partir d'un nom de lieu
 * Cette fonction simule des coordonnées pour les principales villes françaises
 * En production, il faudrait utiliser un service de géocodage
 */
export const getCoordinatesFromLocation = (location: string): [number, number] => {
  // Simulation de coordonnées pour les villes françaises
  switch (location.toLowerCase()) {
    case 'dakar': return [48.8566, 2.3522];
    case 'saint-louis': return [45.7640, 4.8357];
    case 'thies': return [43.2965, 5.3698];
    case 'tambacounda': return [43.6047, 1.4437];
    case 'diourbel': return [43.7102, 7.2620];
    case 'fatick': return [47.2184, -1.5534];
    case 'matam': return [48.5734, 7.7521];
    case 'podor': return [43.6108, 3.8767];
    case 'kaffrine': return [44.8378, -0.5792];
    case 'kedougou': return [50.6292, 3.0573];
    default: 
      // Coordonnées aléatoires autour de la France pour les autres lieux
      const baseCoords = [46.227638, 2.213749]; // Centre de la France
      return [
        baseCoords[0] + (Math.random() * 4) - 2,
        baseCoords[1] + (Math.random() * 4) - 2
      ];
  }
};

/**
 * Calcule la distance entre deux points géographiques en kilomètres
 */
export const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance en km
  return d;
};

/**
 * Convertit les degrés en radians
 */
export const deg2rad = (deg: number) => {
  return deg * (Math.PI/180);
};
