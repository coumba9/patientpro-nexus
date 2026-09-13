import { supabase } from "@/integrations/supabase/client";

export interface SystemSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  twoFactor: boolean;
  activityLog: boolean;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  emailNotifications: false,
  pushNotifications: false,
  twoFactor: false,
  activityLog: true,
  maintenanceMode: false,
  registrationEnabled: true,
};

const KEY_MAP: Record<keyof SystemSettings, string> = {
  emailNotifications: "email_notifications",
  pushNotifications: "push_notifications",
  twoFactor: "two_factor",
  activityLog: "activity_log",
  maintenanceMode: "maintenance_mode",
  registrationEnabled: "registration_enabled",
};

const toBool = (value: unknown): boolean => value === true || value === "true";

export const settingsService = {
  /** Lit tous les réglages accessibles (admin: tous, public: maintenance + inscriptions). */
  async getSettings(): Promise<SystemSettings> {
    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value");

    if (error) throw error;

    const byKey = new Map((data ?? []).map((row) => [row.key, row.value]));
    const result = { ...DEFAULT_SETTINGS };

    (Object.keys(KEY_MAP) as Array<keyof SystemSettings>).forEach((field) => {
      const dbKey = KEY_MAP[field];
      if (byKey.has(dbKey)) {
        result[field] = toBool(byKey.get(dbKey));
      }
    });

    return result;
  },

  /** Lit uniquement les réglages publics (mode maintenance, inscriptions). */
  async getPublicSettings(): Promise<Pick<SystemSettings, "maintenanceMode" | "registrationEnabled">> {
    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", ["maintenance_mode", "registration_enabled"]);

    if (error) throw error;

    const byKey = new Map((data ?? []).map((row) => [row.key, row.value]));

    return {
      maintenanceMode: byKey.has("maintenance_mode")
        ? toBool(byKey.get("maintenance_mode"))
        : DEFAULT_SETTINGS.maintenanceMode,
      registrationEnabled: byKey.has("registration_enabled")
        ? toBool(byKey.get("registration_enabled"))
        : DEFAULT_SETTINGS.registrationEnabled,
    };
  },

  /** Enregistre les réglages (réservé aux administrateurs par les règles d'accès). */
  async saveSettings(settings: SystemSettings): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const adminId = userData?.user?.id ?? null;

    const rows = (Object.keys(KEY_MAP) as Array<keyof SystemSettings>).map((field) => ({
      key: KEY_MAP[field],
      value: settings[field] as unknown as never,
      updated_by: adminId,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("system_settings")
      .upsert(rows, { onConflict: "key" });

    if (error) throw error;
  },
};
