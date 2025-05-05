
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientsTable } from "@/components/admin/patients/PatientsTable";
import { PatientStats } from "@/components/admin/patients/PatientStats";
import { ExportButton } from "@/components/admin/patients/ExportButton";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const PatientsPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Patients</h1>
        
        <PatientStats />
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Liste des Patients</CardTitle>
            <ExportButton />
          </CardHeader>
          <CardContent>
            <PatientsTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientsPage;
