-- Ajouter le statut "no_show" pour les rendez-vous manqués
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS no_show_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'forfeited')),
ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS can_reschedule_without_penalty BOOLEAN DEFAULT true;

-- Créer une table pour les factures
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled')),
  payment_date TIMESTAMP WITH TIME ZONE,
  invoice_number TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur la table invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour invoices
CREATE POLICY "Users can view invoices they're involved in"
ON public.invoices
FOR SELECT
USING (
  auth.uid() = patient_id OR auth.uid() = doctor_id
);

CREATE POLICY "Admins can manage all invoices"
ON public.invoices
FOR ALL
USING (has_role(auth.uid(), 'admin'::public.app_role));

-- Trigger pour updated_at sur invoices
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Créer une table pour les politiques de reprogrammation
CREATE TABLE IF NOT EXISTS public.reschedule_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hours_before_appointment INTEGER NOT NULL DEFAULT 24,
  penalty_percentage NUMERIC(5, 2) DEFAULT 0,
  max_reschedules INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insérer une politique par défaut
INSERT INTO public.reschedule_policies (hours_before_appointment, penalty_percentage, max_reschedules)
VALUES (24, 50, 2)
ON CONFLICT DO NOTHING;

-- Activer RLS
ALTER TABLE public.reschedule_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reschedule policies"
ON public.reschedule_policies
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage reschedule policies"
ON public.reschedule_policies
FOR ALL
USING (has_role(auth.uid(), 'admin'::public.app_role));

-- Ajouter un compteur de reprogrammations sur appointments
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS reschedule_count INTEGER DEFAULT 0;