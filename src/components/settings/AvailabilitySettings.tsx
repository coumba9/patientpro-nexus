import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Clock, Plus, Trash2, Pencil, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface Holiday {
  id: string;
  startDate: Date;
  endDate: Date;
  reason: string;
}

const DAYS_OF_WEEK = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const DAY_ORDER: Record<string, number> = {
  "Lundi": 0, "Mardi": 1, "Mercredi": 2, "Jeudi": 3, 
  "Vendredi": 4, "Samedi": 5, "Dimanche": 6
};

const sortSlotsByDay = (slots: TimeSlot[]) => {
  return [...slots].sort((a, b) => (DAY_ORDER[a.day] ?? 99) - (DAY_ORDER[b.day] ?? 99));
};

export const AvailabilitySettings = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("availability");
  const [loading, setLoading] = useState(true);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const [newTimeSlot, setNewTimeSlot] = useState<Omit<TimeSlot, "id">>({
    day: "Lundi",
    startTime: "09:00",
    endTime: "17:00"
  });

  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);

  const [newHoliday, setNewHoliday] = useState<Omit<Holiday, "id">>({
    startDate: new Date(),
    endDate: new Date(),
    reason: ""
  });

  const [isTimeSlotDialogOpen, setIsTimeSlotDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [checkingConflicts, setCheckingConflicts] = useState(false);

  // Load data from Supabase
  const loadAvailability = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: slots, error: slotsError } = await supabase
        .from('doctor_availability_slots' as any)
        .select('*')
        .eq('doctor_id', user.id);

      if (slotsError) throw slotsError;

      const { data: periods, error: periodsError } = await supabase
        .from('doctor_unavailability_periods' as any)
        .select('*')
        .eq('doctor_id', user.id);

      if (periodsError) throw periodsError;

      const mappedSlots: TimeSlot[] = ((slots as any[]) || []).map((s: any) => ({
        id: s.id,
        day: s.day,
        startTime: s.start_time?.substring(0, 5) || "09:00",
        endTime: s.end_time?.substring(0, 5) || "17:00",
      }));
      setTimeSlots(sortSlotsByDay(mappedSlots));

      const mappedHolidays: Holiday[] = ((periods as any[]) || []).map((h: any) => ({
        id: h.id,
        startDate: new Date(h.start_date),
        endDate: new Date(h.end_date),
        reason: h.reason,
      }));
      setHolidays(mappedHolidays);
    } catch (error) {
      console.error('Error loading availability:', error);
      toast.error("Erreur lors du chargement des disponibilités");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  // Map French day names to JS day numbers (0=Sunday)
  const dayToJsDay: Record<string, number> = {
    "Dimanche": 0, "Lundi": 1, "Mardi": 2, "Mercredi": 3,
    "Jeudi": 4, "Vendredi": 5, "Samedi": 6
  };

  const checkAppointmentConflicts = async (day: string, startTime: string, endTime: string, excludeSlotId?: string): Promise<boolean> => {
    if (!user?.id) return false;
    setCheckingConflicts(true);
    
    try {
      // Get upcoming appointments for this doctor on the given day
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 3);
      
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('date, time, status')
        .eq('doctor_id', user.id)
        .in('status', ['pending', 'confirmed'])
        .gte('date', today.toISOString().split('T')[0])
        .lte('date', nextMonth.toISOString().split('T')[0]);

      if (error) throw error;

      // Filter appointments that fall on this day of week
      const jsDay = dayToJsDay[day];
      const conflictingAppointments = (appointments || []).filter(apt => {
        const aptDate = new Date(apt.date);
        if (aptDate.getDay() !== jsDay) return false;
        
        // Check if appointment time falls outside new slot range
        const aptTime = apt.time;
        return aptTime < startTime || aptTime >= endTime;
      });

      if (conflictingAppointments.length > 0) {
        toast.error(
          `Impossible de modifier ce créneau : ${conflictingAppointments.length} rendez-vous existant(s) seraient en conflit`,
          { duration: 5000 }
        );
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return false;
    } finally {
      setCheckingConflicts(false);
    }
  };

  const notifyAdminOfChange = async (changeType: string, details: string) => {
    if (!user?.id) return;
    
    try {
      await supabase.functions.invoke('notify-availability-change', {
        body: { changeType, details }
      });
    } catch (error) {
      console.error('Error notifying admin:', error);
      // Non-blocking
    }
  };

  const handleAddTimeSlot = async () => {
    // Check for conflicts
    const hasConflict = await checkAppointmentConflicts(newTimeSlot.day, newTimeSlot.startTime, newTimeSlot.endTime);
    if (hasConflict) return;

    if (newTimeSlot.startTime >= newTimeSlot.endTime) {
      toast.error("L'heure de début doit être avant l'heure de fin");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('doctor_availability_slots' as any)
        .insert({
          doctor_id: user!.id,
          day: newTimeSlot.day,
          start_time: newTimeSlot.startTime,
          end_time: newTimeSlot.endTime,
        } as any)
        .select()
        .single();

      if (error) throw error;

      const newSlot: TimeSlot = {
        id: (data as any).id,
        day: newTimeSlot.day,
        startTime: newTimeSlot.startTime,
        endTime: newTimeSlot.endTime,
      };
      setTimeSlots(sortSlotsByDay([...timeSlots, newSlot]));
      setIsTimeSlotDialogOpen(false);
      setNewTimeSlot({ day: "Lundi", startTime: "09:00", endTime: "17:00" });
      toast.success("Créneau ajouté avec succès");
      notifyAdminOfChange("ajouté", `${newTimeSlot.day} ${newTimeSlot.startTime}-${newTimeSlot.endTime}`);
    } catch (error: any) {
      console.error('Error adding slot:', error);
      if (error?.code === '23505') {
        toast.error("Ce créneau existe déjà");
      } else {
        toast.error("Erreur lors de l'ajout du créneau");
      }
    }
  };

  const handleEditTimeSlot = (slot: TimeSlot) => {
    setEditingSlot({ ...slot });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingSlot) return;

    if (editingSlot.startTime >= editingSlot.endTime) {
      toast.error("L'heure de début doit être avant l'heure de fin");
      return;
    }

    // Check for appointment conflicts with new times
    const hasConflict = await checkAppointmentConflicts(
      editingSlot.day, editingSlot.startTime, editingSlot.endTime, editingSlot.id
    );
    if (hasConflict) return;

    try {
      const { error } = await supabase
        .from('doctor_availability_slots' as any)
        .update({
          day: editingSlot.day,
          start_time: editingSlot.startTime,
          end_time: editingSlot.endTime,
        } as any)
        .eq('id', editingSlot.id);

      if (error) throw error;

      setTimeSlots(sortSlotsByDay(
        timeSlots.map(s => s.id === editingSlot.id ? editingSlot : s)
      ));
      setIsEditDialogOpen(false);
      toast.success("Créneau modifié avec succès");
      notifyAdminOfChange("modifié", `${editingSlot.day} ${editingSlot.startTime}-${editingSlot.endTime}`);
      setEditingSlot(null);
    } catch (error) {
      console.error('Error updating slot:', error);
      toast.error("Erreur lors de la modification du créneau");
    }
  };

  const handleDeleteTimeSlot = async (slot: TimeSlot) => {
    // Check if there are appointments on this day
    const hasConflict = await checkAppointmentConflicts(slot.day, "00:00", "23:59");
    if (hasConflict) {
      toast.error("Impossible de supprimer : des rendez-vous sont programmés sur ce créneau");
      return;
    }

    try {
      const { error } = await supabase
        .from('doctor_availability_slots' as any)
        .delete()
        .eq('id', slot.id);

      if (error) throw error;

      setTimeSlots(timeSlots.filter(s => s.id !== slot.id));
      toast.success("Créneau supprimé");
      notifyAdminOfChange("supprimé", `${slot.day} ${slot.startTime}-${slot.endTime}`);
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error("Erreur lors de la suppression du créneau");
    }
  };

  const handleAddHoliday = () => {
    if (!newHoliday.reason.trim()) {
      toast.error("Veuillez indiquer une raison");
      return;
    }
    if (newHoliday.startDate > newHoliday.endDate) {
      toast.error("La date de début doit être avant la date de fin");
      return;
    }

    const addHolidayAsync = async () => {
      try {
        const { data, error } = await supabase
          .from('doctor_unavailability_periods' as any)
          .insert({
            doctor_id: user!.id,
            start_date: newHoliday.startDate.toISOString().split('T')[0],
            end_date: newHoliday.endDate.toISOString().split('T')[0],
            reason: newHoliday.reason,
          } as any)
          .select()
          .single();

        if (error) throw error;

        const newEntry: Holiday = {
          id: (data as any).id,
          startDate: newHoliday.startDate,
          endDate: newHoliday.endDate,
          reason: newHoliday.reason,
        };
        setHolidays([...holidays, newEntry]);
        setIsHolidayDialogOpen(false);
        setNewHoliday({ startDate: new Date(), endDate: new Date(), reason: "" });
        toast.success("Période d'absence ajoutée");
        notifyAdminOfChange(
          "ajouté une absence",
          `${newHoliday.startDate.toLocaleDateString('fr-FR')} au ${newHoliday.endDate.toLocaleDateString('fr-FR')} (${newHoliday.reason})`
        );
      } catch (error) {
        console.error('Error adding holiday:', error);
        toast.error("Erreur lors de l'ajout de la période d'absence");
      }
    };
    addHolidayAsync();
  };

  const handleDeleteHoliday = async (id: string) => {
    try {
      const { error } = await supabase
        .from('doctor_unavailability_periods' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHolidays(holidays.filter(holiday => holiday.id !== id));
      toast.success("Période d'absence supprimée");
    } catch (error) {
      console.error('Error deleting holiday:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Time slot dialog content (shared between add and edit)
  const renderTimeSlotForm = (
    slotData: Omit<TimeSlot, "id"> | TimeSlot,
    setSlotData: (data: any) => void,
    onSubmit: () => void,
    submitLabel: string
  ) => (
    <div className="space-y-4 mt-4">
      <div>
        <Label htmlFor="day">Jour</Label>
        <select 
          id="day"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={slotData.day}
          onChange={(e) => setSlotData({ ...slotData, day: e.target.value })}
        >
          {DAYS_OF_WEEK.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">Heure de début</Label>
          <Input 
            id="startTime"
            type="time"
            value={slotData.startTime}
            onChange={(e) => setSlotData({ ...slotData, startTime: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="endTime">Heure de fin</Label>
          <Input 
            id="endTime"
            type="time"
            value={slotData.endTime}
            onChange={(e) => setSlotData({ ...slotData, endTime: e.target.value })}
          />
        </div>
      </div>
      <Button onClick={onSubmit} className="w-full" disabled={checkingConflicts}>
        {checkingConflicts ? "Vérification des conflits..." : submitLabel}
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Clock className="h-5 w-5 text-primary animate-spin" />
        <p className="text-muted-foreground">Chargement des disponibilités...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Gestion des disponibilités</h3>
      </div>

      <Tabs defaultValue="availability" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="availability">Créneaux horaires</TabsTrigger>
          <TabsTrigger value="holidays">Congés & Absences</TabsTrigger>
        </TabsList>

        <TabsContent value="availability" className="mt-4">
          <div className="flex justify-between mb-4">
            <h4 className="text-md font-medium">Disponibilités hebdomadaires</h4>
            <Dialog open={isTimeSlotDialogOpen} onOpenChange={setIsTimeSlotDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter un créneau
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un créneau horaire</DialogTitle>
                </DialogHeader>
                {renderTimeSlotForm(newTimeSlot, setNewTimeSlot, handleAddTimeSlot, "Ajouter")}
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-3">
            {sortSlotsByDay(timeSlots).map(slot => (
              <Card key={slot.id} className="bg-background">
                <CardContent className="pt-4 px-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{slot.day}</p>
                    <p className="text-sm text-muted-foreground">{slot.startTime} - {slot.endTime}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditTimeSlot(slot)}
                      title="Modifier"
                    >
                      <Pencil className="h-4 w-4 text-primary" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteTimeSlot(slot)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Edit dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier le créneau horaire</DialogTitle>
              </DialogHeader>
              {editingSlot && renderTimeSlotForm(
                editingSlot,
                setEditingSlot,
                handleSaveEdit,
                "Enregistrer"
              )}
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>Les modifications ne sont pas possibles s'il y a des rendez-vous déjà programmés sur ce créneau.</p>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="holidays" className="mt-4">
          <div className="flex justify-between mb-4">
            <h4 className="text-md font-medium">Périodes d'absence</h4>
            <Dialog open={isHolidayDialogOpen} onOpenChange={setIsHolidayDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter une absence
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une période d'absence</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Date de début</Label>
                      <div className="mt-2">
                        <Calendar
                          mode="single"
                          selected={newHoliday.startDate}
                          onSelect={(date) => date && setNewHoliday({ ...newHoliday, startDate: date })}
                          className="rounded-md border"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="endDate">Date de fin</Label>
                      <div className="mt-2">
                        <Calendar
                          mode="single"
                          selected={newHoliday.endDate}
                          onSelect={(date) => date && setNewHoliday({ ...newHoliday, endDate: date })}
                          className="rounded-md border"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reason">Raison</Label>
                    <Input 
                      id="reason"
                      value={newHoliday.reason}
                      onChange={(e) => setNewHoliday({ ...newHoliday, reason: e.target.value })}
                      placeholder="Congés, formation, etc."
                    />
                  </div>
                  <Button onClick={handleAddHoliday} className="w-full">Ajouter</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {holidays.map(holiday => (
              <Card key={holiday.id} className="bg-background">
                <CardContent className="pt-4 px-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{holiday.reason}</p>
                    <p className="text-sm text-muted-foreground">
                      Du {holiday.startDate.toLocaleDateString('fr-FR')} au {holiday.endDate.toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteHoliday(holiday.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
