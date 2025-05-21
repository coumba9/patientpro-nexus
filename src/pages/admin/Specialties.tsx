
import { SpecialtiesTable } from "@/components/admin/specialties/SpecialtiesTable";
import { SpecialtyStats } from "@/components/admin/specialties/SpecialtyStats"; 
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const Specialties = () => {
  return (
    <div className="flex">
      <div className="hidden md:block w-64 border-r min-h-screen p-4">
        <AdminSidebar />
      </div>
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Gestion des spécialités</h1>
        <SpecialtyStats />
        <div className="mt-6">
          <SpecialtiesTable />
        </div>
      </div>
    </div>
  );
};

export default Specialties;
