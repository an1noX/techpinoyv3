
import { Json } from "@/integrations/supabase/types";

export type { Json };

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  brand: string;
  quantityInStock: number;
  imageUrl: string;
}

export interface PrinterType {
  id: string;
  make: string;
  series: string;
  model: string;
  status: PrinterStatusType;
  type?: string;
  description?: string;
  category?: string;
  price?: number;
  rentalPrice?: number;
  quantityInStock?: number;
  isRentalAvailable?: boolean;
  isFeatured?: boolean;
  serialNumber?: string;
  location?: string;
  department?: string;
  departmentId?: string;
  client?: string;
  clientId?: string;
  ownership?: PrinterOwnershipType;
  assignedAdmin?: string;
  assignedUserId?: string;
  notes?: string;
  toners?: string[];
  imageUrl?: string;
  oemToner?: string;
}

export interface PrinterSeries {
  id: string;
  name: string;
  makeId: string;
}

export type PrinterStatusType = "available" | "rented" | "maintenance" | "deployed" | "for_repair" | "unknown" | "retired";
export type PrinterOwnershipType = "system_asset" | "client_owned";

export interface TonerType {
  id: string;
  name: string;
  model: string;
  brand?: string;
  color?: string;
  page_yield?: number;
  stock?: number;
  threshold?: number;
  description?: string;
  price?: number;
  oem_code?: string | null;
  variant_name?: string | null;
  compatibility?: string[];
  aliases?: string[] | null;
  is_base_model?: boolean;
  base_model_reference?: string | null;
  variant_details?: Record<string, any> | null;
  manufacturer?: string;
  category?: string[];
  imageUrl?: string;
  is_active?: boolean;
  compatible_printers?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

// For use in edit forms
export interface EditableToner extends TonerType {
  isEditing?: boolean;
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
  // Join data when querying with toner reference
  toner?: Partial<OEMToner>; // Changed to Partial to make it more flexible
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

export interface MaintenanceLogType {
  id: string;
  printerId: string;
  printerModel: string;
  date: string;
  notes: string;
  performedBy: string;
  scheduled?: boolean;
  scheduledDate?: string;
}

export interface TransferLogType {
  id: string;
  printerId: string;
  printerModel: string;
  fromClient?: string;
  fromClientId?: string;
  fromDepartment?: string;
  fromDepartmentId?: string;
  fromUser?: string;
  fromUserId?: string;
  toClient?: string;
  toClientId?: string;
  toDepartment?: string;
  toDepartmentId?: string;
  toUser?: string;
  toUserId?: string;
  date: string;
  notes?: string;
  transferredBy: string;
}

// Enhanced Toner Type for the Store page
export interface EnhancedTonerType extends TonerType {
  quantityInStock: number;
}
