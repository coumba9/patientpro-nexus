
import { Shield, Heart, Lightbulb, Users } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Confiance",
    description: "La sécurité et la confidentialité de vos données sont notre priorité absolue. Nous respectons scrupuleusement les normes les plus strictes en matière de protection des données de santé.",
  },
  {
    icon: Heart,
    title: "Excellence",
    description: "Nous nous engageons à fournir un service de la plus haute qualité. Notre plateforme est constamment améliorée pour répondre aux besoins de nos utilisateurs.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "Nous utilisons les dernières technologies pour améliorer l'expérience de santé. Notre équipe travaille continuellement à l'innovation pour simplifier l'accès aux soins.",
  },
  {
    icon: Users,
    title: "Accessibilité",
    description: "Nous croyons que chacun mérite un accès facile aux soins de santé. Notre plateforme est conçue pour être accessible à tous, partout en France.",
  },
];

const Values = () => {
  return (
    <div className="min-h-screen">
      <div className="relative bg-gradient-to-b from-sky-50 to-white pt-24 pb-32">
        <div className="container relative z-10">
          <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Nos valeurs
          </h1>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
            Des valeurs fortes qui guident chacune de nos actions pour améliorer l'accès aux soins.
          </p>
        </div>
      </div>

      <div className="container py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <value.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-24 bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Rejoignez l'aventure MediConnect
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Ensemble, construisons l'avenir de la santé en France. Notre engagement est de rendre les soins de santé plus accessibles et efficaces pour tous.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Values;
