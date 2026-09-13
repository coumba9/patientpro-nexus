import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { getSearchAvailability } from '@/api/services/searchAvailability.service';
import { parseLocalDateString } from '@/lib/availability';

interface AvailabilityCalendarProps {
  doctorId: string;
  onSelectSlot?: (date: string, time: string) => void;
}
export const AvailabilityCalendar = ({ doctorId, onSelectSlot }: AvailabilityCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['search-calendar', doctorId],
    queryFn: () => getSearchAvailability([doctorId]),
    staleTime: 30000,
    refetchInterval: 60000,
  });
  const dates = [...new Set(data.map(slot => slot.slot_date))];
  const activeDate = selectedDate && dates.includes(selectedDate) ? selectedDate : dates[0];
  const times = [...new Set(data.filter(slot => slot.slot_date === activeDate).map(slot => slot.slot_time))];
  if (isLoading) return <p role="status">Chargement des disponibilités…</p>;
  if (error) return <div role="alert"><p>Disponibilités inaccessibles. Vérifiez votre connexion à votre compte.</p><Button variant="outline" onClick={() => refetch()}>Réessayer</Button></div>;
  return <section aria-label="Disponibilités">
    <h4 className="font-medium mb-3">Disponibilités sur les 30 prochains jours</h4>
    {!dates.length ? <p className="text-sm text-muted-foreground">Aucun créneau disponible</p> : <>
      <div className="flex flex-wrap gap-2 mb-4">{dates.map(day => <Button key={day} variant={day === activeDate ? 'default' : 'outline'} onClick={() => setSelectedDate(day)}>{parseLocalDateString(day).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</Button>)}</div>
      <div className="flex flex-wrap gap-2">{times.map(time => <Button key={time} variant="outline" size="sm" onClick={() => onSelectSlot?.(activeDate, time)}>{time}</Button>)}</div>
    </>}
  </section>;
};
export default AvailabilityCalendar;
