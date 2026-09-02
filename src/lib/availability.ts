/** Utilitaires partagés pour les disponibilités et créneaux de rendez-vous. */

/** Jours de la semaine tels que stockés en base (index = getDay()). */
export const WEEKDAYS_FR = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

/** Date locale au format YYYY-MM-DD (évite le décalage d'ISO/UTC). */
export const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** "09:30" -> 570 */
export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

/** 570 -> "09:30" */
export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export interface AvailabilityRange {
  start_time: string;
  end_time: string;
  location_id?: string | null;
}

export interface UnavailabilityPeriod {
  is_full_day?: boolean | null;
  start_time?: string | null;
  end_time?: string | null;
}

export interface BookedAppointment {
  time: string;
  duration_minutes?: number | null;
}

export interface ComputeSlotsInput {
  /** Plages récurrentes du médecin pour le jour sélectionné. */
  ranges: AvailabilityRange[];
  /** Congés / absences couvrant ce jour. */
  unavailability?: UnavailabilityPeriod[];
  /** Rendez-vous déjà réservés (non annulés) ce jour-là. */
  booked?: BookedAppointment[];
  /** Durée du motif de consultation choisi. */
  durationMinutes: number;
  /** Date sélectionnée (locale). */
  selectedDate: Date;
  /** Lieu d'exercice choisi (optionnel). */
  locationId?: string | null;
  /** Horodatage courant, en heure locale du navigateur. */
  now?: Date;
}

/**
 * Calcule les créneaux réellement réservables :
 * - découpés selon la durée du motif,
 * - dans les plages publiées par le médecin (filtrées par lieu),
 * - hors congés/absences (journée entière ou partielle),
 * - hors rendez-vous déjà réservés (chevauchement),
 * - hors heures déjà passées (comparaison en heure locale, sans conversion UTC).
 */
export const computeAvailableSlots = ({
  ranges,
  unavailability = [],
  booked = [],
  durationMinutes,
  selectedDate,
  locationId,
  now = new Date(),
}: ComputeSlotsInput): string[] => {
  if (!durationMinutes || durationMinutes <= 0) return [];

  const usableRanges = ranges.filter(
    (r) => !locationId || !r.location_id || r.location_id === locationId
  );
  if (usableRanges.length === 0) return [];

  // Journée entièrement bloquée
  if (unavailability.some((u) => u.is_full_day)) return [];

  const bookedIntervals = booked.map((apt) => {
    const start = timeToMinutes(String(apt.time).substring(0, 5));
    return { start, end: start + (apt.duration_minutes || 30) };
  });

  // Comparaison en date locale : toLocalDateString évite le décalage UTC.
  const isToday = toLocalDateString(selectedDate) === toLocalDateString(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const slots: string[] = [];

  usableRanges.forEach((range) => {
    const start = timeToMinutes(String(range.start_time).substring(0, 5));
    const end = timeToMinutes(String(range.end_time).substring(0, 5));

    for (let t = start; t + durationMinutes <= end; t += durationMinutes) {
      const slotStart = t;
      const slotEnd = t + durationMinutes;

      if (isToday && slotStart <= nowMinutes) continue;

      const inAbsence = unavailability.some((u) => {
        if (u.is_full_day || !u.start_time || !u.end_time) return false;
        const aStart = timeToMinutes(String(u.start_time).substring(0, 5));
        const aEnd = timeToMinutes(String(u.end_time).substring(0, 5));
        return slotStart < aEnd && slotEnd > aStart;
      });
      if (inAbsence) continue;

      if (bookedIntervals.some((b) => slotStart < b.end && slotEnd > b.start)) continue;

      const label = minutesToTime(slotStart);
      if (!slots.includes(label)) slots.push(label);
    }
  });

  return slots.sort();
};

