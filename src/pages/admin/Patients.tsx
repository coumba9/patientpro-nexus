
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientsTable } from "@/components/admin/patients/PatientsTable";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const PatientsPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Gestion des Patients</CardTitle>
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
