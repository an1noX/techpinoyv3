
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
}

// Add PrinterStatus type
export type PrinterStatus = 'available' | 'rented' | 'maintenance';
