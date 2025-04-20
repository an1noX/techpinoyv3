import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FrontendSettings, StoreInfo } from "@/types/settings";
import { Json } from "@/types/types";

export interface JsonSettings {
  [key: string]: Json;
}

interface SettingsContextType {
  settings: FrontendSettings;
  isLoading: boolean;
  updateSettings: (settings: FrontendSettings) => Promise<void>;
  updateStoreInfo: (storeInfo: StoreInfo) => Promise<void>;
}

const defaultStoreInfo: StoreInfo = {
  storeName: "TechPinoy",
  tagline: "",
  phoneNumber: "(877) 518-1272",
  email: "support@techpinoy.com",
  officeHours: "Mon–Fri 9:00AM – 6:00PM",
  address: "",
  liveChat: {
    enabled: false,
    type: "messenger",
    value: ""
  },
  socialMedia: {
    facebook: "",
    instagram: "",
    youtube: "",
    twitter: ""
  }
};

const defaultSettings: FrontendSettings = {
  companyName: 'Print Management System',
  mainMenuItems: [],
  footerSections: [],
  showUnderConstructionModal: false,
  storeInfo: defaultStoreInfo
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
  updateSettings: async () => {},
  updateStoreInfo: async () => {}
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<FrontendSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStoreInfo = async () => {
    try {
      // First try to get existing record
      const { data: storeData, error: storeError } = await supabase
        .from('store_information')
        .select('*')
        .limit(1)
        .single();

      if (storeError && storeError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error("Error loading store information:", storeError);
        throw storeError;
      }

      // If no data exists, create default entry
      if (!storeData) {
        console.log("No store information found, creating default entry...");
        
        const { data: newStoreData, error: createError } = await supabase
          .from('store_information')
          .insert([{
            store_name: defaultStoreInfo.storeName,
            tagline: defaultStoreInfo.tagline,
            phone_number: defaultStoreInfo.phoneNumber,
            email: defaultStoreInfo.email,
            office_hours: defaultStoreInfo.officeHours,
            address: defaultStoreInfo.address,
            live_chat: defaultStoreInfo.liveChat,
            social_media: defaultStoreInfo.socialMedia
          }])
          .select()
          .single();

        if (createError) {
          console.error("Error creating default store information:", createError);
          throw createError;
        }

        return newStoreData;
      }

      return storeData;
    } catch (error) {
      console.error("Error in fetchStoreInfo:", error);
      throw error;
    }
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);

      // Fetch store information first
      let storeData;
      try {
        storeData = await fetchStoreInfo();
      } catch (error) {
        console.error("Failed to fetch store information:", error);
        storeData = null;
      }

      // Then fetch general settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('frontend')
        .eq('id', 'default')
        .single();
      
      if (settingsError) {
        console.error("Error loading settings:", settingsError);
      }

      // Convert and merge the data
      const frontendSettings = settingsData?.frontend as JsonSettings;
      const merged: FrontendSettings = {
        ...defaultSettings,
        ...frontendSettings,
        storeInfo: storeData ? {
          storeName: storeData.store_name,
          tagline: storeData.tagline,
          phoneNumber: storeData.phone_number,
          email: storeData.email,
          officeHours: storeData.office_hours,
          address: storeData.address,
          liveChat: storeData.live_chat,
          socialMedia: storeData.social_media
        } : defaultStoreInfo
      };
      
      setSettings(merged);
    } catch (error) {
      console.error("Error loading settings:", error);
      // Use default settings on error
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStoreInfo = async (storeInfo: StoreInfo) => {
    try {
      // Convert from camelCase to snake_case for database
      const dbData = {
        store_name: storeInfo.storeName,
        tagline: storeInfo.tagline,
        phone_number: storeInfo.phoneNumber,
        email: storeInfo.email,
        office_hours: storeInfo.officeHours,
        address: storeInfo.address,
        live_chat: storeInfo.liveChat,
        social_media: storeInfo.socialMedia,
        updated_at: new Date().toISOString()
      };

      // Get the existing record
      const { data: existingData, error: queryError } = await supabase
        .from('store_information')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (queryError) {
        console.error("Error querying existing store information:", queryError);
        throw queryError;
      }

      // Perform upsert with ID if it exists
      const { error: upsertError } = await supabase
        .from('store_information')
        .upsert({
          ...dbData,
          id: existingData?.id
        }, {
          onConflict: 'id'
        });

      if (upsertError) {
        console.error("Error upserting store information:", upsertError);
        throw upsertError;
      }

      // Update local state
      setSettings(prev => ({
        ...prev,
        storeInfo
      }));

      // Refetch to ensure we have the latest data
      await fetchSettings();
    } catch (error) {
      console.error("Error updating store information:", error);
      throw error;
    }
  };

  // Initialize settings
  useEffect(() => {
    fetchSettings();
  }, []);

  // Set up Supabase realtime subscription
  useEffect(() => {
    const subscription = supabase
      .channel('store_information_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'store_information'
        },
        (payload) => {
          console.log('Store information changed:', payload);
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      isLoading, 
      updateSettings,
      updateStoreInfo
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
