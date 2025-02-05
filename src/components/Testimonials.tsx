import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Marie Dubois",
    role: "Patiente",
    content:
      "Une plateforme qui a révolutionné ma façon de gérer ma santé. Plus besoin d'attendre des heures au téléphone pour prendre rendez-vous !",
    rating: 5,
  },
  {
    name: "Dr. Thomas Martin",
    role: "Cardiologue",
    content:
      "Un outil professionnel qui me permet de me concentrer sur l'essentiel : mes patients. La gestion des rendez-vous n'a jamais été aussi simple.",
    rating: 5,
  },
  {
    name: "Sophie Laurent",
    role: "Patiente",
    content:
      "J'apprécie particulièrement la fonction de téléconsultation. C'est pratique pour les suivis simples ou les renouvellements d'ordonnance.",
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-16">
          Ce qu'ils pensent de nous
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 p-6 rounded-lg"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-4">{testimonial.content}</p>
              <div className="font-semibold">{testimonial.name}</div>
              <div className="text-sm text-gray-500">{testimonial.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};