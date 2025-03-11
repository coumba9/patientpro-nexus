
import { Calendar, MessageCircle, FileText } from "lucide-react";

interface AppointmentStatsProps {
  appointmentsCount: number;
}

export const AppointmentStats = ({ appointmentsCount }: AppointmentStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Prochains RDV</h3>
        </div>
        <p className="text-2xl font-bold mt-2">{appointmentsCount}</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-green-500" />
          <h3 className="font-semibold">Messages non lus</h3>
        </div>
        <p className="text-2xl font-bold mt-2">3</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold">Documents</h3>
        </div>
        <p className="text-2xl font-bold mt-2">5</p>
      </div>
    </div>
  );
};
