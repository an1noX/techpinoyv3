
export type PrinterStatus = 'available' | 'rented' | 'maintenance' | 'for_repair' | 'deployed';
export type OwnershipType = 'system' | 'client';

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
