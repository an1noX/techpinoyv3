
export interface Printer {
  id: string;
  make: string;
  series: string;
  model: string;
  status: PrinterStatus;
  owned_by: string;
  assigned_to?: string;
  department?: string;
  location?: string;
  created_at: string;
  updated_at: string;
  is_for_rent?: boolean;
  client_id?: string;
}

export type PrinterStatus = 'available' | 'rented' | 'maintenance';

export interface WikiPrinter {
  id: string;
  make: string;
  series: string;
  model: string;
  maintenance_tips?: string;
  specs?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  printers?: PrinterSummary[]; // Changed to PrinterSummary[] for join query results
}

// New type for simplified printer data returned in join queries
export interface PrinterSummary {
  id: string;
  make: string;
  model: string;
  status: string;
  location?: string;
  series?: string;
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
  notes?: string | null;
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
  client?: string;
  printer?: string;
  signature_url?: string | null;
  agreement_url?: string | null;
  next_available_date?: string | null;
  inquiry_count?: number;
  booking_count?: number;
}

export interface RentalOption {
  id: string;
  printer_id: string;
  is_for_rent: boolean;
  rental_rate: number;
  rate_unit: string;
  minimum_duration: number;
  duration_unit: string;
  security_deposit: number;
  availability?: any;
  terms?: string;
  cancellation_policy?: string;
  created_at: string;
  updated_at: string;
}
