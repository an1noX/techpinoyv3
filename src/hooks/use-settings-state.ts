
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Settings, StoreInfo, Json } from '@/types/settings';

const defaultSettings: Settings = {
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
  updated_at: new Date().toISOString()
};

export const useSettingsState = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createInitialSettings = async () => {
    try {
      const settingsData = {
        store_name: defaultSettings.store_name,
        tagline: defaultSettings.tagline,
        phone_number: defaultSettings.phone_number,
        email: defaultSettings.email,
        office_hours: defaultSettings.office_hours,
        address: defaultSettings.address,
        live_chat: defaultSettings.live_chat as unknown as Json,
        social_media: defaultSettings.social_media as unknown as Json
      };

      const { error: insertError } = await supabase
        .from('system_settings')
        .insert(settingsData);

      if (insertError) {
        throw insertError;
      }
    } catch (err: any) {
      console.error('Error creating settings:', err);
      throw new Error('Failed to create initial settings');
    }
  };

  const formatSettingsData = (data: any): Settings => {
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

    const formattedSettings: Settings = {
      id: data.id || '',
      store_name: data.store_name || defaultSettings.store_name,
      tagline: data.tagline || defaultSettings.tagline,
      phone_number: data.phone_number || defaultSettings.phone_number,
      email: data.email || defaultSettings.email,
      office_hours: data.office_hours || defaultSettings.office_hours,
      address: data.address || defaultSettings.address,
      live_chat: liveChatData || defaultSettings.live_chat,
      social_media: socialMediaData || defaultSettings.social_media,
      updated_at: data.updated_at || new Date().toISOString()
    };

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

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          await createInitialSettings();
          const { data: newData, error: newError } = await supabase
            .from('system_settings')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(1)
            .single();
            
          if (newError) throw newError;
          if (newData) {
            setSettings(formatSettingsData(newData));
          } else {
            setSettings(defaultSettings);
          }
        } else {
          throw error;
        }
      } else if (data) {
        setSettings(formatSettingsData(data));
      } else {
        await createInitialSettings();
        setSettings(defaultSettings);
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to load settings');
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (updatedSettings: Settings) => {
    try {
      setIsLoading(true);
      setError(null);
      
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
      
      const { error: saveError } = await supabase
        .from('system_settings')
        .upsert(settingsToSave);
        
      if (saveError) {
        throw saveError;
      }
      
      setSettings(updatedSettings);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStoreInfo = async (storeInfo: StoreInfo) => {
    if (!settings) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Updating store info:", storeInfo);
      
      const updatedSettings: Settings = {
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
      console.log("Settings updated successfully");
    } catch (err: any) {
      console.error('Error updating store info:', err);
      setError(err.message || 'Failed to update store info');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    isLoading,
    error,
    fetchSettings,
    saveSettings,
    updateStoreInfo
  };
};
