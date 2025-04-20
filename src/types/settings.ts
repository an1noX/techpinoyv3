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

export interface HeaderConfig {
  logo?: string;
  searchPlaceholder?: string;
  showContactSection?: boolean;
  showHelpSection?: boolean;
  showCart?: boolean;
  navigationLinks?: Array<{ label: string; link: string; }>;
}

export interface FrontendSettings {
  companyName: string;
  mainMenuItems: any[];
  footerSections: any[];
  showUnderConstructionModal: boolean;
  headerConfig?: HeaderConfig;
  storeInfo?: StoreInfo;
}