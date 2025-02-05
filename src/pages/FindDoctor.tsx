import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";
import { useState } from "react";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  location: string;
  availability: string;
  rating: number;
}

const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Sarah Martin",
    specialty: "Cardiologue",
    location: "Paris",
    availability: "Disponible aujourd'hui",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Dr. Thomas Bernard",
    specialty: "Dermatologue",
    location: "Lyon",
    availability: "Disponible demain",
    rating: 4.9,
  },
  {
    id: 3,
    name: "Dr. Marie Dubois",
    specialty: "Pédiatre",
    location: "Marseille",
    availability: "Disponible cette semaine",
    rating: 4.7,
  },
];

const FindDoctor = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>(mockDoctors);

  const handleSearch = () => {
    const filtered = mockDoctors.filter(
      (doctor) =>
        (doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())) &&
        doctor.location.toLowerCase().includes(location.toLowerCase())
    );
    setFilteredDoctors(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Trouver un médecin</h1>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <Search className="w-4 h-4" />
              </div>
              <Input
                placeholder="Spécialité ou nom du médecin"
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px] relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <MapPin className="w-4 h-4" />
              </div>
              <Input
                placeholder="Localisation"
                className="pl-9"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button className="flex gap-2" onClick={handleSearch}>
              <Search className="w-4 h-4" />
              Rechercher
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{doctor.name}</h3>
              <p className="text-gray-600 mb-1">{doctor.specialty}</p>
              <p className="text-gray-600 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                {doctor.location}
              </p>
              <p className="text-green-600 mb-4">{doctor.availability}</p>
              <div className="flex justify-between items-center">
                <div className="text-yellow-500">★ {doctor.rating}</div>
                <Button>Prendre RDV</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FindDoctor;