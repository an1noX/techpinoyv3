
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
export type PrinterStatus = 'available' | 'rented' | 'maintenance';

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
