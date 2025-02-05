import { CalendarDays, Search, Stethoscope, Video } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Recherchez",
    description: "Trouvez le bon professionnel de santé selon vos besoins",
  },
  {
    icon: CalendarDays,
    title: "Réservez",
    description: "Choisissez un créneau qui vous convient en quelques clics",
  },
  {
    icon: Video,
    title: "Consultez",
    description: "En cabinet ou en téléconsultation selon vos préférences",
  },
  {
    icon: Stethoscope,
    title: "Suivez",
    description: "Gérez votre santé avec votre espace personnel",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-16">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-sky-100 rounded-full flex items-center justify-center">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};