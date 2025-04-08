
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Marie Dubois",
    role: "Patiente",
    content:
      "Une plateforme qui a révolutionné ma façon de gérer ma santé. Plus besoin d'attendre des heures au téléphone pour prendre rendez-vous !",
    rating: 5,
    image: "/placeholder.svg"
  },
  {
    name: "Dr. Thomas Martin",
    role: "Cardiologue",
    content:
      "Un outil professionnel qui me permet de me concentrer sur l'essentiel : mes patients. La gestion des rendez-vous n'a jamais été aussi simple.",
    rating: 5,
    image: "/placeholder.svg"
  },
  {
    name: "Sophie Laurent",
    role: "Patiente",
    content:
      "J'apprécie particulièrement la fonction de téléconsultation. C'est pratique pour les suivis simples ou les renouvellements d'ordonnance.",
    rating: 5,
    image: "/placeholder.svg"
  },
];

export const Testimonials = () => {
  return (
    <section className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gray-50 dark:bg-gray-800"></div>
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ce qu'ils pensent de nous
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Découvrez les témoignages de nos utilisateurs satisfaits, patients comme médecins
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 italic">{testimonial.content}</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
