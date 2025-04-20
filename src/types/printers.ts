
export type PrinterStatus = 
  | 'available' 
  | 'rented' 
  | 'maintenance' 
  | 'for_repair' 
  | 'unknown' 
  | 'deployed' 
  | 'retired';

export type MaintenanceStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'unrepairable'
  | 'decommissioned';

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
}

export interface Department {
  id: string;
  name: string;
  client_id?: string;
}

export interface MaintenanceRecord {
  id: string;
  printer_id: string;
  issue_description: string;
  status: MaintenanceStatus;
  reported_by: string;
  reported_at: string;
  diagnosed_by?: string;
  diagnosis_date?: string;
  diagnostic_notes?: string;
  activity_type: 'repair' | 'maintenance';
  started_at?: string;
  completed_at?: string;
  technician?: string;
  repair_notes?: string;
  parts_used?: string;
  cost?: number;
  next_maintenance_date?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceReport {
  id: string;
  maintenance_record_id: string;
  report_content: any;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface QuickUpdateData {
  printer_id: string;
  problems: string[];
  solutions: string[];
  status_change?: PrinterStatus;
  technician: string;
  action_date: string;
  remarks?: string;
}
