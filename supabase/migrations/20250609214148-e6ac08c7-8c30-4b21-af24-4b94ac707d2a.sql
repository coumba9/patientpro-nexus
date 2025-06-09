
-- Créer la table notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('cancellation', 'reminder', 'queue', 'appointment')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID NOT NULL,
  appointment_id UUID,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table reminders
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24h', '2h', 'manual')),
  method TEXT NOT NULL CHECK (method IN ('phone', 'sms', 'email')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table queue_entries pour la file d'attente
CREATE TABLE public.queue_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  requested_doctor_id UUID,
  specialty_id UUID,
  urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('urgent', 'normal', 'flexible')),
  preferred_dates DATE[],
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'assigned', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_entries ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiques RLS pour reminders
CREATE POLICY "Admins can manage reminders" ON public.reminders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques RLS pour queue_entries
CREATE POLICY "Admins can manage queue" ON public.queue_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Patients can view their own queue entries" ON public.queue_entries
  FOR SELECT USING (auth.uid() = patient_id);
