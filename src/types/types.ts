
export type PrinterStatus = 'available' | 'rented' | 'maintenance' | 'for_repair' | 'deployed';
export type OwnershipType = 'system' | 'client';
export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed' | 'unrepairable' | 'decommissioned';
export type PrinterStatusType = PrinterStatus; // Alias for backward compatibility
export type PrinterOwnershipType = 'system_asset' | 'client_owned';
export type UserRole = 'admin' | 'technician' | 'client';

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
  videoUrl?: string;
}

// For the TonerList component
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

export interface EditableToner extends TonerBase {
  id: string;
  isEditing?: boolean;
  name?: string;
  compatible_printers?: string[] | null;
  variant_details?: Record<string, any> | null;
}

// For printer components
export interface PrinterType {
  id: string;
  make: string;
  series: string;
  model: string;
  status: PrinterStatus;
  type?: string;
  description?: string;
  category?: string;
  price?: number;
  rentalPrice?: number;
  quantityInStock?: number;
  imageUrl?: string;
  isRentalAvailable?: boolean;
  isFeatured?: boolean;
  toners?: string[];
  ownership?: PrinterOwnershipType;
  clientId?: string;
  oemToner?: string;
  owned_by?: OwnershipType;
  assigned_to?: string;
  client_id?: string;
  department?: string;
  location?: string;
  is_for_rent?: boolean;
  created_at?: string;
  updated_at?: string;
  serialNumber?: string;
  notes?: string;
}

export interface TonerType {
  id: string;
  name?: string;
  model: string;
  brand?: string;
  color?: string;
  page_yield?: number;
  compatible_printers?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface TransferLogType {
  id: string;
  printer_id: string;
  printer_model: string;
  date: string;
  from_client?: string;
  to_client?: string;
  from_department?: string;
  to_department?: string;
  from_user?: string;
  to_user?: string;
  notes?: string;
  transferred_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface MaintenanceLogType {
  id: string;
  printerId: string;
  printerModel: string;
  date: string;
  scheduledDate?: string;
  notes: string;
  scheduled?: boolean;
  performedBy: string;
  created_at?: string;
  updated_at?: string;
}
