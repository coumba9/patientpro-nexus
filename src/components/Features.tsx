import { Calendar, Search, Stethoscope, Video } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Recherche simplifiée",
    description: "Trouvez rapidement le bon professionnel de santé selon vos besoins",
  },
  {
    icon: Calendar,
    title: "Prise de RDV facile",
    description: "Réservez votre consultation en quelques clics, 24h/24 et 7j/7",
  },
  {
    icon: Video,
    title: "Téléconsultation",
    description: "Consultez à distance avec nos médecins certifiés",
  },
  {
    icon: Stethoscope,
    title: "Suivi personnalisé",
    description: "Accédez à votre historique médical et gérez vos documents",
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-16">
          Une plateforme complète pour votre santé
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};