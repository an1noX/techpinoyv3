
export type PrinterStatusType = "available" | "rented" | "maintenance" | "deployed" | "for_repair" | "unknown" | "retired";
export type PrinterOwnershipType = "system_asset" | "client_owned";

export const PRINTER_STATUSES: PrinterStatusType[] = [
  "available",
  "rented", 
  "maintenance",
  "deployed",
  "for_repair", 
  "unknown",
  "retired"
];

export const PRINTER_TYPES = [
  "laser",
  "inkjet",
  "dot_matrix",
  "thermal",
  "3d",
  "multifunction",
  "large_format"
];

export const PRINTER_CATEGORIES = [
  "printer",
  "scanner",
  "copier",
  "fax",
  "multifunction",
  "plotter"
];

export const PRINTER_OWNERSHIP_TYPES: PrinterOwnershipType[] = [
  "system_asset",
  "client_owned"
];
