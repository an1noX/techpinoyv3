import React, { createContext, useContext } from "react";

interface FrontendSettings {
  companyName: string;
  mainMenuItems: any[];
  footerSections: any[];
  showUnderConstructionModal: boolean;
}

interface SettingsContextType {
  settings: FrontendSettings;
  isLoading: boolean;
}

// Static settings for public pages
const staticSettings: FrontendSettings = {
  companyName: 'TechPinoy',
  mainMenuItems: [],
  footerSections: [],
  showUnderConstructionModal: false
};

const StaticSettingsContext = createContext<SettingsContextType>({
  settings: staticSettings,
  isLoading: false
});

export const StaticSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StaticSettingsContext.Provider value={{ settings: staticSettings, isLoading: false }}>
      {children}
    </StaticSettingsContext.Provider>
  );
};

export const useStaticSettings = () => useContext(StaticSettingsContext);