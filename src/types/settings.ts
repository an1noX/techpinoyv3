
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface LiveChat {
  enabled: boolean;
  type: 'messenger' | 'whatsapp' | 'custom';
  value: string;
}

export interface SocialMedia {
  facebook: string;
  instagram: string;
  youtube: string;
  twitter: string;
}

export interface StoreInfo {
  storeName: string;
  tagline: string;
  phoneNumber: string;
  email: string;
  officeHours: string;
  address: string;
  liveChat: LiveChat;
  socialMedia: SocialMedia;
}

export interface VideoAds1 {
  videoType: 'placeholder' | 'youtube' | 'mp4' | 'file';
  videoUrl: string;
  title: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonLink: string;
}

// Rename StoreSettings to Settings everywhere
export interface Settings {
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
  storeInfo?: StoreInfo;
  video_ads1?: VideoAds1;
}

// Update SettingsContextType to use Settings
export interface SettingsContextType {
  settings: Settings | null;
  isLoading: boolean;
  saveSettings: (settings: Settings) => Promise<void>;
  error: string | null;
  updateStoreInfo?: (storeInfo: StoreInfo) => Promise<void>;
  updateVideoAds?: (videoAds: VideoAds1) => Promise<void>;
  fetchSettings: () => Promise<void>;
}
