
// Printer types
export interface Printer {
  id: string;
  make: string;
  series: string;
  model: string;
  status: PrinterStatus;
  ownedBy: 'client' | 'system';
  assignedTo?: string;
  department?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export type PrinterStatus = 'available' | 'rented' | 'maintenance';

// Toner types
export interface Toner {
  id: string;
  brand: string;
  model: string;
  color: 'black' | 'cyan' | 'magenta' | 'yellow';
  pageYield: number;
  compatiblePrinters: string[]; // Array of printer IDs
  stock: number;
  threshold: number;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  assignedPrinters?: string[]; // Array of printer IDs
}

export type UserRole = 'admin' | 'technician' | 'client';

// Rental types
export interface Rental {
  id: string;
  printerId: string;
  clientId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  signatureUrl?: string;
  agreementUrl?: string;
}
