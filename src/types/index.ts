export interface Printer {
  id: string;
  make: string;
  series: string;
  model: string;
  status: PrinterStatus;
  owned_by: string; // Handle "system" or "client"
  assigned_to?: string;
  department?: string;
  location?: string;
  created_at: string;
  updated_at: string;
  is_for_rent?: boolean;
  client_id?: string;
  serialNumber?: string; // synced with types/printers.ts
  notes?: string;
}

export type PrinterStatus = 'available' | 'rented' | 'maintenance' | 'for_repair' | 'deployed';

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

/**
 * Raw toner data from the Supabase 'toners' table
 */
export interface TonerData {
  id: string;
  brand: string;
  model: string;
  color: string;
  page_yield: number;
  stock: number;
  threshold: number;
  compatible_printers: string[] | null;
  created_at: string;
  updated_at: string;
}

/**
 * Commercial toner product for sale.
 * This type is used to transform the raw toner data into a more frontend-friendly format.
 */
export interface TonerProduct {
  id: string;
  name: string;
  description?: string;
  category: string[];
  commercial_products?: CommercialTonerProduct[];
  created_at: string;
  updated_at: string;
}

// Base type for shared toner properties
export interface TonerBase {
  brand: string;
  model: string;
  color: string;
  oem_code?: string | null;
  page_yield: number;
  aliases?: string[] | null;
  variant_group_id?: string | null;
  is_base_model?: boolean;
  variant_name?: string | null;
  base_model_reference?: string | null;
  created_at?: string;
  updated_at?: string;
}

// OEM Toner Reference (Wiki entry)
export interface OEMToner extends TonerBase {
  id: string;
  created_at: string;
  updated_at: string;
  compatible_printers?: string[] | null;
}

// Commercial Toner Product (Inventory item)
export interface CommercialTonerProduct {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock_level: number;
  reorder_point: number;
  category: string[];
  image_url?: string;
  is_active: boolean;
  toner_id: string;
  created_at: string;
  updated_at: string;
  // Make toner optional and a Partial<OEMToner> to match types/types.ts
  toner?: Partial<OEMToner>;
}

// For use in edit forms
export interface EditableOEMToner extends OEMToner {
  isEditing?: boolean;
}

// For creating new OEM toner references
export interface NewOEMToner {
  brand: string;
  model: string;
  color: string;
  oem_code?: string | null;
  page_yield: number;
  aliases?: string[] | null;
}

// For creating new commercial products
export interface NewCommercialProduct {
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock_level: number;
  reorder_point: number;
  category: string[];
  image_url?: string;
  is_active: boolean;
  toner_id: string;
}

// OEM Toner Reference - Used for printer compatibility tracking only, not inventory
export interface Toner extends TonerBase {
  id: string;
  // Variant support
  is_base_model?: boolean;
  base_model_reference?: string | null;
  variant_details?: Record<string, any> | null;
  // Commercial product fields
  is_commercial_product?: boolean;
  price?: number;
  stock?: number;
  threshold?: number;
  description?: string;
  category?: string[];
  image_url?: string;
  is_active?: boolean;
  compatible_printers?: string[];
  created_at: string;
  updated_at: string;
}

// For use in edit forms
export interface EditableToner extends Toner {
  isEditing?: boolean;
}

// For creating new toners
export interface NewToner extends TonerBase {
  id?: string;
}
