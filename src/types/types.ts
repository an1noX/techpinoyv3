
export type PrinterStatus = 'available' | 'rented' | 'maintenance' | 'for_repair' | 'deployed';
export type OwnershipType = 'system' | 'client';
export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed' | 'unrepairable' | 'decommissioned';
export type UserRole = 'admin' | 'user' | 'technician' | 'client';

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

export interface WikiPrinter {
  id: string;
  make: string;
  series: string;
  model: string;
  description?: string;
  type?: string;
  created_at: string;
  updated_at: string;
  specs?: Record<string, any>;
  maintenance_tips?: string;
}

export interface WikiToner {
  id: string;
  brand: string;
  model: string;
  color: string;
  page_yield: number;
  compatible_printers?: Record<string, any>;
  stock: number;
  threshold: number;
  created_at: string;
  updated_at: string;
  image_url?: string;
  is_active: boolean;
  is_commercial_product?: boolean;
  variant_details?: Record<string, any>;
  is_base_model?: boolean;
  base_model_reference?: string;
  variant_group_id?: string;
  aliases?: any[];
  variant_name?: string;
  description?: string;
  sku?: string;
  oem_code?: string;
  category?: string[];
}

export interface CommercialTonerProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock_level: number;
  reorder_point: number;
  is_active: boolean;
  toner_id?: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  category: string[];
  description?: string;
  toner?: WikiToner;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  quantityInStock: number;
  imageUrl: string;
}

export interface TonerType {
  id: string;
  name: string;
  brand: string;
  model: string;
  color: string;
  page_yield: number;
  oem_code?: string;
  aliases?: string[];
}

export interface OEMToner {
  id: string;
  brand: string;
  model: string;
  color: string;
  oem_code?: string | null;
  page_yield: number;
  aliases?: any[];
  compatible_printers?: any;
  created_at: string;
  updated_at: string;
}

export interface EditableToner extends WikiToner {
  name?: string;
  isEditing?: boolean;
}

export interface TonerBase {
  brand: string;
  model: string;
  color: string;
  oem_code?: string | null;
  page_yield: number;
  aliases?: string[];
  is_base_model?: boolean;
  base_model_reference?: string | null;
  variant_name?: string | null;
}

export interface UserWithRole {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}
