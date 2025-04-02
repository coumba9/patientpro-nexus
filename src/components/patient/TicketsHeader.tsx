
import { Ticket } from "lucide-react";

interface TicketsHeaderProps {
  title: string;
}

export const TicketsHeader = ({ title }: TicketsHeaderProps) => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Ticket className="h-6 w-6 text-primary" />
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
  );
};
