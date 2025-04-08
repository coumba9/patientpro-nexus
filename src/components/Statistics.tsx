
import { motion } from "framer-motion";

const stats = [
  {
    number: "100k+",
    label: "Patients satisfaits",
  },
  {
    number: "10k+",
    label: "Médecins certifiés",
  },
  {
    number: "500k+",
    label: "Rendez-vous pris",
  },
  {
    number: "24/7",
    label: "Support disponible",
  },
];

export const Statistics = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-primary/90 to-blue-600">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center relative"
            >
              <div className="absolute inset-0 bg-white/10 rounded-xl blur-sm transform rotate-3"></div>
              <div className="relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
