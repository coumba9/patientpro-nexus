import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Aminata Diallo",
    role: "Patiente",
    content: "Une plateforme qui a révolutionné ma façon de gérer ma santé. Plus besoin d'attendre des heures pour prendre rendez-vous !",
    rating: 5,
  },
  {
    name: "Dr. Ibrahima Ndiaye",
    role: "Cardiologue",
    content: "Un outil professionnel qui me permet de me concentrer sur l'essentiel : mes patients. La gestion des rendez-vous n'a jamais été aussi simple.",
    rating: 5,
  },
  {
    name: "Fatou Sarr",
    role: "Patiente",
    content: "J'apprécie particulièrement la fonction de téléconsultation. C'est pratique pour les suivis simples ou les renouvellements d'ordonnance.",
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-50" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-medical-mint/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full mb-6">
            <span className="text-sm font-medium text-primary">Témoignages</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
            Ce que disent nos <span className="gradient-text">patients</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
              whileHover={{ y: -8 }}
              className="medical-card group"
            >
              <Quote className="w-10 h-10 text-primary/20 mb-4" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < testimonial.rating ? "fill-secondary text-secondary" : "fill-muted text-muted"}`}
                  />
                ))}
              </div>
              
              <p className="text-foreground mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-soft">
                  <span className="text-primary-foreground font-display font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-display font-bold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
