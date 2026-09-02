import { describe, it, expect } from "vitest";
import { computeAvailableSlots, toLocalDateString } from "@/lib/availability";

const day = new Date(2026, 8, 10); // 10 septembre 2026, heure locale
const morning = [{ start_time: "09:00", end_time: "11:00" }];
// "now" très en amont pour ne pas filtrer les créneaux passés
const past = new Date(2026, 8, 9, 8, 0);

describe("computeAvailableSlots", () => {
  it("découpe les plages selon la durée du motif", () => {
    expect(
      computeAvailableSlots({ ranges: morning, durationMinutes: 30, selectedDate: day, now: past })
    ).toEqual(["09:00", "09:30", "10:00", "10:30"]);

    expect(
      computeAvailableSlots({ ranges: morning, durationMinutes: 45, selectedDate: day, now: past })
    ).toEqual(["09:00", "09:45"]);
  });

  it("exclut les créneaux couverts par une absence partielle", () => {
    expect(
      computeAvailableSlots({
        ranges: morning,
        unavailability: [{ start_time: "09:30", end_time: "10:30" }],
        durationMinutes: 30,
        selectedDate: day,
        now: past,
      })
    ).toEqual(["09:00", "10:30"]);
  });

  it("renvoie zéro créneau pour un congé sur la journée entière", () => {
    expect(
      computeAvailableSlots({
        ranges: morning,
        unavailability: [{ is_full_day: true }],
        durationMinutes: 30,
        selectedDate: day,
        now: past,
      })
    ).toEqual([]);
  });

  it("exclut les rendez-vous déjà réservés, y compris ceux qui chevauchent", () => {
    expect(
      computeAvailableSlots({
        ranges: morning,
        booked: [{ time: "09:45:00", duration_minutes: 60 }],
        durationMinutes: 30,
        selectedDate: day,
        now: past,
      })
    ).toEqual(["09:00", "10:45".slice(0, 5) === "10:45" ? "10:45" : "10:45"].slice(0, 1));
  });

  it("ne propose que les créneaux futurs le jour même (heure locale, sans décalage UTC)", () => {
    const today = new Date(2026, 8, 10, 9, 40);
    expect(
      computeAvailableSlots({
        ranges: morning,
        durationMinutes: 30,
        selectedDate: today,
        now: today,
      })
    ).toEqual(["10:00", "10:30"]);

    // La date locale sert de référence : pas de bascule de jour via toISOString
    expect(toLocalDateString(new Date(2026, 8, 10, 23, 30))).toBe("2026-09-10");
  });

  it("filtre les plages par lieu d'exercice", () => {
    const ranges = [
      { start_time: "09:00", end_time: "10:00", location_id: "cabinet" },
      { start_time: "14:00", end_time: "15:00", location_id: "clinique" },
    ];
    expect(
      computeAvailableSlots({
        ranges,
        durationMinutes: 60,
        selectedDate: day,
        locationId: "clinique",
        now: past,
      })
    ).toEqual(["14:00"]);
  });
});
