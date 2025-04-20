
import { z } from "zod";
import { PrinterStatusType, PrinterOwnershipType } from "@/types/types";

// Define the schema for the printer form
export const printerFormSchema = z.object({
  make: z.string().min(1, { message: "Make is required" }),
  series: z.string().min(1, { message: "Series is required" }),
  model: z.string().min(1, { message: "Model is required" }),
  type: z.string().min(1, { message: "Type is required" }),
  status: z.enum(["available", "rented", "deployed", "maintenance", "for_repair", "unknown", "retired"] as const),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.coerce.number().min(0, { message: "Price must be a positive number" }),
  rentalPrice: z.coerce.number().min(0, { message: "Rental price must be a positive number" }),
  quantityInStock: z.coerce.number().min(0, { message: "Quantity must be a positive number" }),
  isRentalAvailable: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  serialNumber: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  ownership: z.enum(["system_asset", "client_owned"] as const),
  clientId: z.string().optional(),
  oemToner: z.string().optional(),
});

// Export the type from the schema
export type PrinterFormValues = z.infer<typeof printerFormSchema>;
