
import { MaintenanceLogType, TransferLogType, WikiToner, TonerType } from "@/types/types";

/**
 * Converts snake_case property names from Supabase to camelCase for frontend components
 */
export function toFrontendMaintenanceLog(log: MaintenanceLogType): any {
  return {
    id: log.id,
    printerId: log.printer_id,
    printerModel: log.printer_model,
    performedBy: log.performed_by,
    date: log.date,
    notes: log.notes,
    createdAt: log.created_at,
    updatedAt: log.updated_at,
    scheduled: log.scheduled,
    scheduledDate: log.scheduled_date,
  };
}

/**
 * Converts camelCase property names from frontend to snake_case for Supabase
 */
export function toBackendMaintenanceLog(log: any): MaintenanceLogType {
  return {
    id: log.id,
    printer_id: log.printerId,
    printer_model: log.printerModel,
    performed_by: log.performedBy,
    date: log.date,
    notes: log.notes,
    created_at: log.createdAt,
    updated_at: log.updatedAt,
    scheduled: log.scheduled,
    scheduled_date: log.scheduledDate,
  };
}

/**
 * Converts snake_case property names from Supabase to camelCase for frontend components
 */
export function toFrontendTransferLog(log: TransferLogType): any {
  return {
    id: log.id,
    printerId: log.printer_id,
    printerModel: log.printer_model,
    fromClient: log.from_client,
    toClient: log.to_client,
    fromDepartment: log.from_department,
    toDepartment: log.to_department,
    fromUser: log.from_user,
    toUser: log.to_user,
    transferredBy: log.transferred_by,
    date: log.date,
    notes: log.notes,
    createdAt: log.created_at,
    updatedAt: log.updated_at,
  };
}

/**
 * Converts camelCase property names from frontend to snake_case for Supabase
 */
export function toBackendTransferLog(log: any): TransferLogType {
  return {
    id: log.id,
    printer_id: log.printerId,
    printer_model: log.printerModel,
    from_client: log.fromClient,
    to_client: log.toClient,
    from_department: log.fromDepartment,
    to_department: log.toDepartment,
    from_user: log.fromUser,
    to_user: log.toUser,
    transferred_by: log.transferredBy,
    date: log.date,
    notes: log.notes,
    created_at: log.createdAt,
    updated_at: log.updatedAt,
  };
}

/**
 * Converts WikiToner to TonerType for compatibility
 */
export function wikiTonerToTonerType(wikiToner: WikiToner): TonerType {
  return {
    id: wikiToner.id,
    name: wikiToner.name || `${wikiToner.brand} ${wikiToner.model}`,
    brand: wikiToner.brand,
    model: wikiToner.model,
    color: wikiToner.color,
    page_yield: wikiToner.page_yield,
    oem_code: wikiToner.oem_code,
    aliases: wikiToner.aliases as string[] || [],
    compatibility: [],
    image_url: wikiToner.image_url,
    stock: wikiToner.stock,
    threshold: wikiToner.threshold,
    created_at: wikiToner.created_at,
    updated_at: wikiToner.updated_at,
    is_active: wikiToner.is_active
  };
}

/**
 * Converts an array of WikiToner to TonerType for compatibility
 */
export function wikiTonersToTonerTypes(wikiToners: WikiToner[]): TonerType[] {
  return wikiToners.map(wikiTonerToTonerType);
}
