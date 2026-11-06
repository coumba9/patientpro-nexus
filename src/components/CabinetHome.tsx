import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Phone, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CABINET = {
  name: "JàmmSanté",
  city: "Keur Massar",
  phone: "77 319 68 28",
  phoneHref: "tel:+221773196828",
};

export const CabinetHome = () => (
  <section className="py-20 md:py-28 relative">
    <div className="container grid gap-12 lg:grid-cols-2 items-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground mb-6">
          <Stethoscope className="h-4 w-4" /> Cabinet médical
        </span>
        <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-6">
          Cabinet <span className="gradient-text">{CABINET.name}</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl">
          Consultez nos médecins à {CABINET.city}. Choisissez votre médecin, votre motif et votre créneau, puis réservez en ligne.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="rounded-2xl bg-gradient-primary shadow-soft text-lg px-8 py-6">
            <Link to="/find-doctor"><CalendarDays className="h-5 w-5 mr-2" />Réserver un rendez-vous</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-2xl text-lg px-8 py-6 border-2">
            <a href={CABINET.phoneHref}><Phone className="h-5 w-5 mr-2" />{CABINET.phone}</a>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="rounded-3xl border bg-card p-8 shadow-medium space-y-6"
      >
        <h2 className="text-2xl font-display font-semibold">Nous trouver</h2>
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-accent p-3"><MapPin className="h-5 w-5 text-primary" /></div>
          <div>
            <p className="font-medium">Adresse</p>
            <p className="text-muted-foreground">{CABINET.city}, Dakar, Sénégal</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-accent p-3"><Phone className="h-5 w-5 text-primary" /></div>
          <div>
            <p className="font-medium">Téléphone</p>
            <a href={CABINET.phoneHref} className="text-muted-foreground hover:text-primary">{CABINET.phone}</a>
          </div>
        </div>
        <Button asChild className="w-full rounded-xl bg-gradient-primary">
          <Link to="/find-doctor">Voir nos médecins et leurs créneaux</Link>
        </Button>
      </motion.div>
    </div>
  </section>
);
