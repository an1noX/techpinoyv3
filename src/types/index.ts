export interface Printer {
  id: string;
  make: string;
  series: string;
  model: string;
  status: PrinterStatus;
  ownedBy: string;
  assignedTo?: string;
  department?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  isForRent?: boolean;
}

export type PrinterStatus = 'available' | 'rented' | 'maintenance';

export interface WikiPrinter {
  id: string;
  make: string;
  series: string;
  model: string;
  maintenanceTips?: string;
  specs?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  department: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTypes {
  profiles: Profile;
  printers: Printer;
  printer_client_assignments: PrinterClientAssignment;
  rentals: Rental;
}

export interface PrinterClientAssignment {
  id: string;
  printer_id: string;
  client_id: string;
  assigned_at: string;
  assigned_by: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Rental {
  id: string;
  printer_id: string;
  client_id: string;
  start_date: string;
  end_date: string | null;
  status: string;
  created_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
