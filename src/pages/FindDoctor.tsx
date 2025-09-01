
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import DoctorMap from "@/components/doctor/DoctorMap";
import DoctorList from "@/components/doctor/DoctorList";
import ViewToggle from "@/components/doctor/ViewToggle";
import DoctorPageHeader from "@/components/doctor/DoctorPageHeader";
import DoctorSearchForm from "@/components/doctor/DoctorSearchForm";
import DoctorFilters from "@/components/doctor/DoctorFilters";
import { DoctorProvider, useDoctorContext, Doctor } from "@/contexts/DoctorContext";
import { useAuth } from "@/hooks/useAuth";

const FindDoctorContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [showFilters, setShowFilters] = useState(false);
  const isLoggedIn = !!user;
  
  const { 
    filteredDoctors, 
    selectedRadius,
    userLocation,
    searchTerm,
    location,
    setSearchTerm,
    setLocation,
    setSelectedRadius,
    handleSearch
  } = useDoctorContext();

  // Handle selecting a doctor on the map
  const handleDoctorSelect = (doctorId: number) => {
    const selectedDoctor = filteredDoctors.find(d => d.id === doctorId);
    if (selectedDoctor) {
      handleBooking(selectedDoctor);
    }
  };

  // Handle booking a doctor appointment
  const handleBooking = (doctor: Doctor) => {
    if (!isLoggedIn) {
      toast.info("Vous allez être redirigé vers la page de réservation. Vous pourrez vous connecter par la suite.");
    }
    
    navigate(`/book-appointment?doctor=${encodeURIComponent(doctor.name)}&specialty=${encodeURIComponent(doctor.specialty)}`);
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <DoctorPageHeader onBack={() => navigate(-1)} />
        
        <DoctorSearchForm 
          searchTerm={searchTerm}
          location={location}
          showFilters={showFilters}
          onSearchTermChange={setSearchTerm}
          onLocationChange={setLocation}
          onSearch={handleSearch}
          onToggleFilters={toggleFilters}
        />
        
        <DoctorFilters 
          showFilters={showFilters}
          selectedRadius={selectedRadius}
          onRadiusChange={setSelectedRadius}
        />
        
        <ViewToggle 
          viewMode={viewMode} 
          onViewModeChange={(mode) => setViewMode(mode)} 
        />

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "map")} className="mb-8">
          <TabsContent value="list" className="m-0">
            <DoctorList 
              doctors={filteredDoctors} 
              onBooking={handleBooking} 
            />
          </TabsContent>
          
          <TabsContent value="map" className="m-0">
            <div className="mb-4">
              <DoctorMap 
                doctors={filteredDoctors}
                onDoctorSelect={handleDoctorSelect}
                selectedRadius={selectedRadius}
                userLocation={userLocation}
              />
              <p className="text-sm text-gray-500 mt-2">
                {filteredDoctors.length} médecins trouvés. Cliquez sur un marqueur pour voir les détails.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const FindDoctor = () => {
  return (
    <DoctorProvider>
      <FindDoctorContent />
    </DoctorProvider>
  );
};

export default FindDoctor;
