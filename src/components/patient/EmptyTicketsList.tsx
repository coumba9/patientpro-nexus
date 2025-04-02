
import { Ticket } from "lucide-react";

export const EmptyTicketsList = () => {
  return (
    <div className="bg-blue-50 text-blue-700 rounded-lg p-8 text-center">
      <div className="flex flex-col items-center gap-3">
        <Ticket className="h-12 w-12 text-blue-400" />
        <p className="text-lg">
          Aucun ticket disponible. Les tickets sont créés une fois les rendez-vous confirmés.
        </p>
      </div>
    </div>
  );
};
