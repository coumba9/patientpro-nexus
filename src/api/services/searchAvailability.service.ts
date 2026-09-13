import { supabase } from '@/integrations/supabase/client';
import { parseLocalDateString, toLocalDateString } from '@/lib/availability';

export interface SearchSlot {
  doctor_id: string;
  slot_date: string;
  slot_time: string;
  reason_id: string | null;
  duration_minutes: number;
  location_id: string | null;
  teleconsultation: boolean;
}
export const dakarToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Dakar', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const addDays = (day: string, n: number) => { const d = parseLocalDateString(day); d.setDate(d.getDate() + n); return toLocalDateString(d); };
export const matchesAvailability = (day: string, filter: string, today = dakarToday()) => {
  const weekday = (parseLocalDateString(today).getDay() + 6) % 7;
  const nextMonday = addDays(today, 7 - weekday);
  if (filter === 'today') return day === today;
  if (filter === 'tomorrow') return day === addDays(today, 1);
  if (filter === 'this_week') return day >= today && day < nextMonday;
  if (filter === 'next_week') return day >= nextMonday && day < addDays(nextMonday, 7);
  return true;
};
export async function getSearchAvailability(ids: string[], start = dakarToday(), end = addDays(start, 30)): Promise<SearchSlot[]> {
  const rows: SearchSlot[] = [];
  for (let i = 0; i < ids.length; i += 100) {
    const { data, error } = await supabase.rpc('get_search_availability', { p_doctor_ids: ids.slice(i, i + 100), p_start: start, p_end: end });
    if (error) throw error;
    rows.push(...(data || []));
  }
  return rows;
}
export const slotLabel = (slot: SearchSlot) => `${parseLocalDateString(slot.slot_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} · ${slot.slot_time}`;
