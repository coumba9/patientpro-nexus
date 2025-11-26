import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AppointmentHistoryFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const AppointmentHistoryFilters = ({
  activeFilter,
  onFilterChange
}: AppointmentHistoryFiltersProps) => {
  return (
    <Tabs value={activeFilter} onValueChange={onFilterChange} className="w-full">
      <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
        <TabsTrigger value="all">Tous</TabsTrigger>
        <TabsTrigger value="upcoming">À venir</TabsTrigger>
        <TabsTrigger value="completed">Terminés</TabsTrigger>
        <TabsTrigger value="cancelled">Annulés</TabsTrigger>
        <TabsTrigger value="no_show">Manqués</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
