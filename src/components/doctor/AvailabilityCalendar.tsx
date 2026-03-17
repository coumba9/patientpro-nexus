import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AvailabilityCalendarProps {
  doctorId: string;
  onSelectSlot?: (date: string, time: string) => void;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ doctorId, onSelectSlot }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<Record<string, string[]>>({});
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate calendar days for current month
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0

    const days: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  };

  // Load booked appointments for the visible month
  useEffect(() => {
    const loadMonthAppointments = async () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;

      const { data, error } = await supabase
        .from('appointments')
        .select('date, time')
        .eq('doctor_id', doctorId)
        .neq('status', 'cancelled')
        .gte('date', startDate)
        .lte('date', endDate);

      if (!error && data) {
        const slotMap: Record<string, string[]> = {};
        data.forEach((apt: any) => {
          const dateKey = apt.date;
          if (!slotMap[dateKey]) slotMap[dateKey] = [];
          slotMap[dateKey].push(apt.time?.substring(0, 5));
        });
        setBookedSlots(slotMap);
      }
    };

    loadMonthAppointments();
  }, [doctorId, currentMonth]);

  // Generate available slots when a date is selected
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const booked = bookedSlots[selectedDate] || [];
    const allSlots: string[] = [];
    for (let hour = 8; hour < 18; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    // Filter out past slots for today
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const available = allSlots.filter(slot => {
      if (booked.includes(slot)) return false;
      if (selectedDate === today) {
        const [h, m] = slot.split(':').map(Number);
        const slotTime = new Date();
        slotTime.setHours(h, m, 0, 0);
        if (slotTime <= now) return false;
      }
      return true;
    });

    setAvailableSlots(available);
  }, [selectedDate, bookedSlots]);

  const handleDateClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return; // No past dates
    if (date.getDay() === 0) return; // No Sundays

    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr === selectedDate ? null : dateStr);
  };

  const getDayStatus = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return 'past';
    if (date.getDay() === 0) return 'weekend';

    const dateStr = date.toISOString().split('T')[0];
    const booked = bookedSlots[dateStr]?.length || 0;
    if (booked >= 20) return 'full';
    if (booked > 10) return 'busy';
    return 'available';
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const days = getDaysInMonth();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Disponibilités</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} />;

            const dateStr = date.toISOString().split('T')[0];
            const status = getDayStatus(date);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <button
                key={dateStr}
                onClick={() => handleDateClick(date)}
                disabled={status === 'past' || status === 'weekend' || status === 'full'}
                className={cn(
                  "aspect-square rounded-lg text-sm flex items-center justify-center transition-all relative",
                  status === 'past' && "text-muted-foreground/30 cursor-not-allowed",
                  status === 'weekend' && "text-muted-foreground/30 cursor-not-allowed",
                  status === 'full' && "bg-destructive/10 text-destructive/50 cursor-not-allowed",
                  status === 'busy' && "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100",
                  status === 'available' && "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100",
                  isSelected && "ring-2 ring-primary bg-primary/10 text-primary font-bold",
                  isToday && "font-bold underline"
                )}
              >
                {date.getDate()}
                {status === 'available' && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-50 dark:bg-green-900/20 border border-green-200" />
            Disponible
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200" />
            Peu de créneaux
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-destructive/10 border border-destructive/20" />
            Complet
          </div>
        </div>

        {/* Time slots for selected date */}
        {selectedDate && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Créneaux du {new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h4>
            {availableSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun créneau disponible</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {availableSlots.map(slot => (
                  <Button
                    key={slot}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => onSelectSlot?.(selectedDate, slot)}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailabilityCalendar;
