import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Filter } from "lucide-react";

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Martin",
    specialty: "Cardiologue",
    location: "Paris",
    rating: 4.8,
    availability: "Prochain RDV disponible: Demain",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Dr. Thomas Bernard",
    specialty: "Généraliste",
    location: "Lyon",
    rating: 4.9,
    availability: "Prochain RDV disponible: Aujourd'hui",
    image: "/placeholder.svg",
  },
  // Ajoutez plus de médecins ici
];

const FindDoctor = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Trouver un médecin</h1>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Spécialité ou nom du médecin"
                className="w-full"
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Localisation"
                className="w-full"
                icon={<MapPin className="w-4 h-4" />}
              />
            </div>
            <Button className="flex gap-2">
              <Filter className="w-4 h-4" />
              Filtres
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">{doctor.name}</h3>
                  <p className="text-gray-600">{doctor.specialty}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {doctor.location}
                </p>
                <p className="text-sm text-primary">{doctor.availability}</p>
              </div>
              <Button className="w-full mt-4">Voir le profil</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FindDoctor;