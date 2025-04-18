
// Update Rental type to match actual database schema
export interface Rental {
  id: string;
  printerId: string | null;
  clientId: string | null;
  client: string;
  printer: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled' | 'upcoming';
  signatureUrl?: string | null;
  agreementUrl?: string | null;
  inquiryCount?: number;
  bookingCount?: number;
  nextAvailableDate?: string;
}

// Add Printer type
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

// Add PrinterStatus type
export type PrinterStatus = 'available' | 'rented' | 'maintenance' | 'deployed';

// Add RentalOptions type
export interface RentalOptions {
  id: string;
  printerId: string;
  isForRent: boolean;
  rentalRate: number;
  rateUnit: 'hourly' | 'daily' | 'weekly' | 'monthly';
  minimumDuration: number;
  durationUnit: 'hours' | 'days' | 'weeks' | 'months';
  securityDeposit: number;
  terms: string;
  cancellationPolicy: string;
  availability?: Date[];
  createdAt: string;
  updatedAt: string;
}

// Add WikiPrinter type
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

// Add printer-related RPC types
export interface PrinterMakeRPC {
  id: string;
  name: string;
  created_at: string;
}

export interface PrinterSeriesRPC {
  id: string;
  make_id: string;
  name: string;
  created_at: string;
}

export interface PrinterModelRPC {
  id: string;
  series_id: string;
  name: string;
  created_at: string;
}

export interface AuditLogRPCResponse {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  details: Record<string, any>;
  created_by: string;
  created_at: string;
}

export interface TonerItem {
  id: string;
  brand: string;
  model: string;
  color: string;
  page_yield: number;
}

// Add type for printer model details from RPC
export interface PrinterModelDetails {
  make_name: string;
  series_name: string;
  model_name: string;
}

// Add Client type
export interface Client {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  printers?: {
    id: string;
    make: string;
    model: string;
    status: string;
    location: string;
  }[];
}
