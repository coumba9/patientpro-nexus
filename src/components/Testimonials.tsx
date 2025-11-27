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
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Enhanced background */}
      <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Ce que disent nos{" "}
            <span className="text-transparent bg-clip-text bg-[var(--gradient-primary)]">
              patients
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Des milliers de patients satisfaits font confiance à JàmmSanté
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-card border-2 border-border rounded-3xl p-8 hover:shadow-strong hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 transition-colors ${
                      i < testimonial.rating
                        ? "fill-secondary text-secondary"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-foreground mb-8 leading-relaxed text-lg italic">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4 pt-6 border-t border-border">
                <div className="w-14 h-14 bg-[var(--gradient-primary)] rounded-full flex items-center justify-center shadow-soft">
                  <span className="text-white font-bold text-xl">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-lg">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
