import { useCallback, useEffect, useState } from "react";
import {
  settingsService,
  DEFAULT_SETTINGS,
  type SystemSettings,
} from "@/api/services/settings.service";

/** Réglages complets du système (page d'administration). */
export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error("Error loading system settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateSetting = useCallback(
    <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const save = useCallback(async () => {
    setIsSaving(true);
    try {
      await settingsService.saveSettings(settings);
      return true;
    } catch (error) {
      console.error("Error saving system settings:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  return { settings, setSettings, updateSetting, save, reload: load, isLoading, isSaving };
};

/** Réglages publics (mode maintenance, ouverture des inscriptions). */
export const usePublicSettings = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    settingsService
      .getPublicSettings()
      .then((data) => {
        if (!active) return;
        setMaintenanceMode(data.maintenanceMode);
        setRegistrationEnabled(data.registrationEnabled);
      })
      .catch((error) => console.error("Error loading public settings:", error))
      .finally(() => active && setIsLoading(false));

    return () => {
      active = false;
    };
  }, []);

  return { maintenanceMode, registrationEnabled, isLoading };
};
