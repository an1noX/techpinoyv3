
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/types/types';

// Interfaces for store settings
interface LiveChat {
  enabled: boolean;
  type: string;
  value: string;
}

interface SocialMedia {
  facebook: string;
  instagram: string;
  youtube: string;
  twitter: string;
}

export interface StoreSettings {
  id: string;
  store_name: string;
  tagline: string;
  phone_number: string;
  email: string;
  office_hours: string;
  address: string;
  live_chat: LiveChat;
  social_media: SocialMedia;
  updated_at: string;
  storeInfo?: any; // Added for compatibility with StoreSettings.tsx
}

interface SettingsContextType {
  settings: StoreSettings | null;
  isLoading: boolean;
  saveSettings: (settings: StoreSettings) => Promise<void>;
  error: string | null;
  updateStoreInfo?: (storeInfo: any) => Promise<void>; // Added for compatibility with StoreSettings.tsx
}

// Default settings
const defaultSettings: StoreSettings = {
  id: '',
  store_name: 'TonerPal Store',
  tagline: 'Quality Toner Products for Every Printer',
  phone_number: '+1 (555) 123-4567',
  email: 'support@tonerpal.com',
  office_hours: 'Mon-Fri: 9am-5pm, Sat: 10am-2pm',
  address: '123 Printer Lane, Toner City, TC 12345',
  live_chat: {
    enabled: false,
    type: 'messenger',
    value: ''
  },
  social_media: {
    facebook: '',
    instagram: '',
    youtube: '',
    twitter: ''
  },
  updated_at: new Date().toISOString(),
  storeInfo: null
};

// Create the context
const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  isLoading: true,
  saveSettings: async () => {},
  error: null
});

export const useSettings = () => useContext(SettingsContext);

// Provider component
interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create store settings in database (only need to do this once)
  const createInitialSettings = async () => {
    try {
      // In a real app, we'd do proper validation and handle the case when store_information 
      // table doesn't exist yet, but for this example we'll keep it simple
      const { error } = await supabase
        .from('store_information')
        .insert({
          store_name: defaultSettings.store_name,
          tagline: defaultSettings.tagline,
          phone_number: defaultSettings.phone_number,
          email: defaultSettings.email,
          office_hours: defaultSettings.office_hours,
          address: defaultSettings.address,
          live_chat: defaultSettings.live_chat as unknown as Json,
          social_media: defaultSettings.social_media as unknown as Json
        });

      if (error) {
        console.error('Error creating settings:', error);
        setError(error.message);
      }
    } catch (err: any) {
      console.error('Error in createInitialSettings:', err);
      setError('Failed to create initial settings');
    }
  };

  // Fetch settings from database
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Query the store_information table
      const { data, error } = await supabase
        .from('store_information')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
        
      if (error) {
        // If the table doesn't exist or is empty, create initial settings
        if (error.code === 'PGRST116') {
          await createInitialSettings();
          // After creating, fetch again
          const { data: newData, error: newError } = await supabase
            .from('store_information')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(1)
            .single();
            
          if (newError) {
            throw newError;
          }
          
          if (newData) {
            setSettings(formatSettingsData(newData));
          } else {
            // If still no data, use default
            setSettings(defaultSettings);
          }
        } else {
          throw error;
        }
      } else if (data) {
        setSettings(formatSettingsData(data));
      } else {
        // No error but no data either, create initial
        await createInitialSettings();
        setSettings(defaultSettings);
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to load settings');
      setSettings(defaultSettings); // Use default as fallback
    } finally {
      setIsLoading(false);
    }
  };

  // Format the data from the database
  const formatSettingsData = (data: any): StoreSettings => {
    // Handle case where JSON fields might be stored as strings
    let liveChatData = data.live_chat;
    let socialMediaData = data.social_media;
    
    if (typeof liveChatData === 'string') {
      try {
        liveChatData = JSON.parse(liveChatData);
      } catch (e) {
        liveChatData = defaultSettings.live_chat;
      }
    }
    
    if (typeof socialMediaData === 'string') {
      try {
        socialMediaData = JSON.parse(socialMediaData);
      } catch (e) {
        socialMediaData = defaultSettings.social_media;
      }
    }
    
    // Ensure liveChatData has all required fields
    if (!liveChatData || typeof liveChatData !== 'object') {
      liveChatData = defaultSettings.live_chat;
    } else {
      liveChatData = {
        enabled: liveChatData.enabled ?? defaultSettings.live_chat.enabled,
        type: liveChatData.type ?? defaultSettings.live_chat.type,
        value: liveChatData.value ?? defaultSettings.live_chat.value
      };
    }
    
    // Ensure socialMediaData has all required fields
    if (!socialMediaData || typeof socialMediaData !== 'object') {
      socialMediaData = defaultSettings.social_media;
    } else {
      socialMediaData = {
        facebook: socialMediaData.facebook ?? defaultSettings.social_media.facebook,
        instagram: socialMediaData.instagram ?? defaultSettings.social_media.instagram,
        youtube: socialMediaData.youtube ?? defaultSettings.social_media.youtube,
        twitter: socialMediaData.twitter ?? defaultSettings.social_media.twitter
      };
    }
    
    const formattedSettings: StoreSettings = {
      id: data.id || '',
      store_name: data.store_name || defaultSettings.store_name,
      tagline: data.tagline || defaultSettings.tagline,
      phone_number: data.phone_number || defaultSettings.phone_number,
      email: data.email || defaultSettings.email,
      office_hours: data.office_hours || defaultSettings.office_hours,
      address: data.address || defaultSettings.address,
      live_chat: liveChatData as LiveChat,
      social_media: socialMediaData as SocialMedia,
      updated_at: data.updated_at || new Date().toISOString()
    };
    
    // Add storeInfo for compatibility with StoreSettings.tsx
    formattedSettings.storeInfo = {
      storeName: formattedSettings.store_name,
      tagline: formattedSettings.tagline,
      phoneNumber: formattedSettings.phone_number,
      email: formattedSettings.email,
      officeHours: formattedSettings.office_hours,
      address: formattedSettings.address,
      liveChat: formattedSettings.live_chat,
      socialMedia: formattedSettings.social_media
    };
    
    return formattedSettings;
  };

  // Save settings to database
  const saveSettings = async (updatedSettings: StoreSettings) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Prepare data for saving
      const settingsToSave = {
        id: updatedSettings.id,
        store_name: updatedSettings.store_name,
        tagline: updatedSettings.tagline,
        phone_number: updatedSettings.phone_number,
        email: updatedSettings.email,
        office_hours: updatedSettings.office_hours,
        address: updatedSettings.address,
        live_chat: updatedSettings.live_chat as unknown as Json,
        social_media: updatedSettings.social_media as unknown as Json,
        updated_at: new Date().toISOString()
      };
      
      // Perform the upsert (update or insert)
      const { error } = await supabase
        .from('store_information')
        .upsert(settingsToSave);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setSettings(updatedSettings);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Update store info (compatibility with StoreSettings.tsx)
  const updateStoreInfo = async (storeInfo: any) => {
    if (!settings) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedSettings: StoreSettings = {
        ...settings,
        store_name: storeInfo.storeName,
        tagline: storeInfo.tagline,
        phone_number: storeInfo.phoneNumber,
        email: storeInfo.email,
        office_hours: storeInfo.officeHours,
        address: storeInfo.address,
        live_chat: storeInfo.liveChat,
        social_media: storeInfo.socialMedia,
        updated_at: new Date().toISOString(),
        storeInfo
      };

      await saveSettings(updatedSettings);
    } catch (err: any) {
      console.error('Error updating store info:', err);
      setError(err.message || 'Failed to update store info');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load of settings
  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      isLoading, 
      saveSettings, 
      error,
      updateStoreInfo
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Static Settings Context (for use in Store page without requiring auth)
interface StaticSettingsContextType {
  settings: StoreSettings | null;
  isLoading: boolean;
}

const StaticSettingsContext = createContext<StaticSettingsContextType>({
  settings: null,
  isLoading: true
});

export const useStaticSettings = () => useContext(StaticSettingsContext);

export const StaticSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStaticSettings = async () => {
      try {
        setIsLoading(true);
        // Try to get settings from store_information
        const { data, error } = await supabase
          .from('store_information')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(1)
          .single();
          
        if (error) {
          console.log('Using default settings since none found in database');
          setSettings(defaultSettings);
        } else if (data) {
          // Handle case where JSON fields might be stored as strings
          let liveChatData = data.live_chat;
          let socialMediaData = data.social_media;
          
          if (typeof liveChatData === 'string') {
            try {
              liveChatData = JSON.parse(liveChatData);
            } catch (e) {
              liveChatData = defaultSettings.live_chat;
            }
          }
          
          if (typeof socialMediaData === 'string') {
            try {
              socialMediaData = JSON.parse(socialMediaData);
            } catch (e) {
              socialMediaData = defaultSettings.social_media;
            }
          }
          
          const formattedSettings: StoreSettings = {
            id: data.id || '',
            store_name: data.store_name || defaultSettings.store_name,
            tagline: data.tagline || defaultSettings.tagline,
            phone_number: data.phone_number || defaultSettings.phone_number,
            email: data.email || defaultSettings.email,
            office_hours: data.office_hours || defaultSettings.office_hours,
            address: data.address || defaultSettings.address,
            live_chat: liveChatData as LiveChat || defaultSettings.live_chat,
            social_media: socialMediaData as SocialMedia || defaultSettings.social_media,
            updated_at: data.updated_at || new Date().toISOString()
          };
          
          // Add storeInfo for compatibility
          formattedSettings.storeInfo = {
            storeName: formattedSettings.store_name,
            tagline: formattedSettings.tagline,
            phoneNumber: formattedSettings.phone_number,
            email: formattedSettings.email,
            officeHours: formattedSettings.office_hours,
            address: formattedSettings.address,
            liveChat: formattedSettings.live_chat,
            socialMedia: formattedSettings.social_media
          };
          
          setSettings(formattedSettings);
        } else {
          setSettings(defaultSettings);
        }
      } catch (err) {
        console.error('Error fetching static settings:', err);
        setSettings(defaultSettings); // Use default as fallback
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStaticSettings();
  }, []);

  return (
    <StaticSettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </StaticSettingsContext.Provider>
  );
};
