
export type PrinterStatus = 'available' | 'rented' | 'maintenance' | 'for_repair' | 'deployed';
export type OwnershipType = 'system' | 'client';
export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed' | 'unrepairable' | 'decommissioned';
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

// Alias types used in existing components for backwards compatibility
export type PrinterType = Printer;
export type PrinterStatusType = PrinterStatus;
export type PrinterOwnershipType = OwnershipType;

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

export interface TonerType {
  id: string;
  brand: string;
  model: string;
  color: string;
  page_yield: number;
  oem_code?: string;
  compatible_printers?: string[];
  stock?: number;
  threshold?: number;
  sku?: string;
  description?: string;
  category?: string[];
  aliases?: string[];
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EditableToner extends TonerType {
  isEditing?: boolean;
}

export interface TonerBase {
  id: string;
  brand: string;
  model: string;
  color: string;
}

export interface MaintenanceLogType {
  id: string;
  printer_id: string;
  printer_model: string;
  date: string;
  notes: string;
  performed_by: string;
  scheduled?: boolean;
  scheduled_date?: string;
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

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  quantityInStock: number;
  imageUrl?: string;
}

export interface UserWithRole {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
}

export interface PrinterSeries {
  id: string;
  name: string;
  makeId: string;
}

export interface WikiPrinter {
  id: string;
  make: string;
  series: string;
  model: string;
  type?: string;
  description?: string;
  maintenance_tips?: string;
  specs?: any;
  created_at: string;
  updated_at: string;
}

export interface WikiToner {
  id: string;
  brand: string;
  model: string;
  color: string;
  page_yield: number;
  oem_code?: string;
  compatible_printers?: any;
  aliases?: any;
  description?: string;
  image_url?: string;
  stock: number;
  threshold: number;
  sku?: string;
  category?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductToner {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  stock_level: number;
  reorder_point: number;
  category?: string[];
  image_url?: string;
  toner_id?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  toner?: WikiToner;
}
