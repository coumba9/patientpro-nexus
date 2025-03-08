
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Clock, Calendar as CalendarIcon, Plus, Trash2, CalendarOff } from "lucide-react";

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

export const AvailabilitySettings = () => {
  const [selectedTab, setSelectedTab] = useState("availability");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: "1", day: "Lundi", startTime: "09:00", endTime: "17:00" },
    { id: "2", day: "Mardi", startTime: "09:00", endTime: "17:00" },
    { id: "3", day: "Mercredi", startTime: "09:00", endTime: "17:00" },
    { id: "4", day: "Jeudi", startTime: "09:00", endTime: "17:00" },
    { id: "5", day: "Vendredi", startTime: "09:00", endTime: "12:00" },
  ]);
  
  const [holidays, setHolidays] = useState<Holiday[]>([
    { 
      id: "1", 
      startDate: new Date(2024, 7, 1), // 1er Août 2024
      endDate: new Date(2024, 7, 15), // 15 Août 2024
      reason: "Congés d'été" 
    }
  ]);

  const [newTimeSlot, setNewTimeSlot] = useState<Omit<TimeSlot, "id">>({
    day: "Lundi",
    startTime: "09:00",
    endTime: "17:00"
  });

  const [newHoliday, setNewHoliday] = useState<Omit<Holiday, "id">>({
    startDate: new Date(),
    endDate: new Date(),
    reason: ""
  });

  const [isTimeSlotDialogOpen, setIsTimeSlotDialogOpen] = useState(false);
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);

  const handleAddTimeSlot = () => {
    const newSlot = {
      id: Date.now().toString(),
      ...newTimeSlot
    };
    setTimeSlots([...timeSlots, newSlot]);
    setIsTimeSlotDialogOpen(false);
    setNewTimeSlot({
      day: "Lundi",
      startTime: "09:00",
      endTime: "17:00"
    });
  };

  const handleDeleteTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  const handleAddHoliday = () => {
    const newEntry = {
      id: Date.now().toString(),
      ...newHoliday
    };
    setHolidays([...holidays, newEntry]);
    setIsHolidayDialogOpen(false);
    setNewHoliday({
      startDate: new Date(),
      endDate: new Date(),
      reason: ""
    });
  };

  const handleDeleteHoliday = (id: string) => {
    setHolidays(holidays.filter(holiday => holiday.id !== id));
  };

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
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="day">Jour</Label>
                    <select 
                      id="day"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={newTimeSlot.day}
                      onChange={(e) => setNewTimeSlot({ ...newTimeSlot, day: e.target.value })}
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
                        value={newTimeSlot.startTime}
                        onChange={(e) => setNewTimeSlot({ ...newTimeSlot, startTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">Heure de fin</Label>
                      <Input 
                        id="endTime"
                        type="time"
                        value={newTimeSlot.endTime}
                        onChange={(e) => setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddTimeSlot} className="w-full">Ajouter</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {timeSlots.map(slot => (
              <Card key={slot.id} className="bg-background">
                <CardContent className="pt-4 px-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{slot.day}</p>
                    <p className="text-sm text-gray-500">{slot.startTime} - {slot.endTime}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteTimeSlot(slot.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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
                    <p className="text-sm text-gray-500">
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
