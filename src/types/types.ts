export type PrinterStatus = 'available' | 'rented' | 'maintenance' | 'for_repair' | 'deployed';
export type OwnershipType = 'system' | 'client';
export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed' | 'unrepairable' | 'decommissioned';

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
}

export interface Printer {
  id: string;
  make: string;
  series: string;
  model: string;
  status: PrinterStatus;
  owned_by: OwnershipType;
  assigned_to?: string;
  client_id?: string;
  department?: string;
  location?: string;
  is_for_rent?: boolean;
  created_at: string;
  updated_at: string;
  serialNumber?: string;
  notes?: string;
}

export interface Department {
  id: string;
  name: string;
  client_id?: string;
}

export interface WikiArticleType {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  associated_with?: string;
  status?: 'published' | 'pending' | 'rejected';
  submitted_by?: string;
  videoUrl?: string; // Added to fix TypeScript error
}
