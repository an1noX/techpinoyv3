
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSettingsState } from '@/hooks/use-settings-state';
import { SettingsContextType } from '@/types/settings';

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  isLoading: true,
  saveSettings: async () => {},
  error: null,
  fetchSettings: async () => {}
});

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const { 
    settings, 
    isLoading, 
    error, 
    fetchSettings, 
    saveSettings, 
    updateStoreInfo 
  } = useSettingsState();

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      isLoading, 
      saveSettings, 
      error,
      updateStoreInfo,
      fetchSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Update StaticSettingsProvider to use Settings type, no functional change
export const StaticSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { settings, isLoading, fetchSettings } = useSettingsState();

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      isLoading, 
      saveSettings: async () => {}, 
      error: null,
      fetchSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
