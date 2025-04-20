
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

export interface MaintenanceSettings {
  enableScheduledMaintenance: boolean;
  defaultMaintenancePeriod: number;
  notifyBeforeDays: number;
  defaultTechnicians: string;
  autoGenerateReports: boolean;
  maintenanceInstructions: string;
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
  maintenance_settings?: MaintenanceSettings;
  updated_at: string;
  storeInfo?: StoreInfo;
}

export interface SettingsContextType {
  settings: StoreSettings | null;
  isLoading: boolean;
  saveSettings: (settings: StoreSettings) => Promise<void>;
  error: string | null;
  updateStoreInfo?: (storeInfo: StoreInfo) => Promise<void>;
}
