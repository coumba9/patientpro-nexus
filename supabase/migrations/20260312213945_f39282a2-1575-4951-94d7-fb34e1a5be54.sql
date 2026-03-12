
-- FAQ table
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL DEFAULT 'Général',
  status text NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published FAQs" ON public.faqs
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all FAQs" ON public.faqs
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Pages table
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  author_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published pages" ON public.pages
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all pages" ON public.pages
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed some initial FAQ data
INSERT INTO public.faqs (question, answer, category, status, sort_order) VALUES
  ('Comment prendre un rendez-vous ?', 'Vous pouvez prendre rendez-vous en ligne via notre plateforme en recherchant un médecin par spécialité ou localisation, puis en sélectionnant un créneau disponible.', 'Rendez-vous', 'published', 1),
  ('Quels sont les modes de paiement acceptés ?', 'Nous acceptons les paiements par carte bancaire, PayTech, et les virements bancaires. Le paiement est sécurisé et peut être effectué en ligne.', 'Paiement', 'published', 2),
  ('Comment annuler un rendez-vous ?', 'Vous pouvez annuler votre rendez-vous depuis votre espace patient dans la section "Mes rendez-vous". Veuillez respecter le délai d''annulation de 24h avant le rendez-vous.', 'Rendez-vous', 'published', 3),
  ('Comment fonctionne la téléconsultation ?', 'La téléconsultation se fait via notre plateforme de vidéoconférence intégrée. Vous recevrez un lien de connexion avant votre rendez-vous.', 'Téléconsultation', 'published', 4);

-- Seed some initial pages data
INSERT INTO public.pages (title, slug, content, status) VALUES
  ('À propos', '/about', 'Page à propos de la plateforme JammSanté.', 'published'),
  ('Nos valeurs', '/values', 'Nos valeurs fondamentales : accessibilité, qualité, innovation.', 'published'),
  ('Contact', '/contact', 'Contactez-nous pour toute question.', 'published');
