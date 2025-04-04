
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import emailjs from "emailjs-com";
import { useToast } from "@/components/ui/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Replace these values with your actual EmailJS service, template and user IDs
    // You'll need to sign up at EmailJS.com and create these
    const serviceId = "service_id"; // Get this from EmailJS dashboard
    const templateId = "template_id"; // Get this from EmailJS dashboard
    const userId = "user_id"; // Get this from EmailJS dashboard
    
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
      to_email: "mfshopp21@gmail.com", // This will be included in the template
    };

    emailjs
      .send(serviceId, templateId, templateParams, userId)
      .then((response) => {
        console.log("Email sent successfully!", response);
        toast({
          title: "Message envoyé !",
          description: "Nous vous répondrons dans les plus brefs délais.",
        });
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setIsSubmitting(false);
      })
      .catch((error) => {
        console.error("Error sending email:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.",
          variant: "destructive",
        });
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white pt-24 pb-32">
      <div className="container">
        <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Contactez-nous
        </h1>
        <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-16">
          Notre équipe est à votre écoute pour répondre à toutes vos questions et vous accompagner dans votre parcours de santé.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-6">Envoyez-nous un message</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nom</label>
                  <Input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Votre nom" 
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com" 
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Sujet</label>
                <Input 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Sujet de votre message" 
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <Textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Votre message..." 
                  className="min-h-[150px]" 
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Envoi en cours..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-semibold mb-6">Nos coordonnées</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-gray-600">mfshopp21@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Téléphone</h3>
                    <p className="text-gray-600">+33 1 23 45 67 89</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Adresse</h3>
                    <p className="text-gray-600">123 rue de la Santé<br />75000 Paris</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-semibold mb-6">Horaires d'ouverture</h2>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">Lundi - Vendredi</span>
                  <span className="font-medium">9h - 19h</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Samedi</span>
                  <span className="font-medium">9h - 12h</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Dimanche</span>
                  <span className="font-medium">Fermé</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
