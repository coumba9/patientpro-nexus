import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, XCircle } from "lucide-react";

interface AppointmentFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts: {
    all: number;
    upcoming: number;
    completed: number;
    cancelled: number;
    pending: number;
  };
}

export const AppointmentFilters = ({
  activeFilter,
  onFilterChange,
  counts,
}: AppointmentFiltersProps) => {
  const filters = [
    {
      id: 'all',
      label: 'Tous',
      icon: Calendar,
      count: counts.all,
      variant: 'default' as const,
    },
    {
      id: 'upcoming',
      label: 'À venir',
      icon: Clock,
      count: counts.upcoming,
      variant: 'default' as const,
    },
    {
      id: 'completed',
      label: 'Terminés',
      icon: CheckCircle,
      count: counts.completed,
      variant: 'secondary' as const,
    },
    {
      id: 'cancelled',
      label: 'Annulés',
      icon: XCircle,
      count: counts.cancelled,
      variant: 'destructive' as const,
    },
    {
      id: 'pending',
      label: 'En attente',
      icon: Clock,
      count: counts.pending,
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          
          return (
            <Button
              key={filter.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(filter.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span>{filter.label}</span>
              <Badge 
                variant={isActive ? "secondary" : "outline"}
                className="ml-1"
              >
                {filter.count}
              </Badge>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
