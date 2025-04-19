
import { query } from './db';
import { v4 as uuidv4 } from 'uuid';

export interface Printer {
  id: string;
  make: string;
  model: string;
  series: string;
  status: string;
  ownedBy: string;
  assignedTo: string | null;
  clientId: string | null;
  department: string | null;
  location: string | null;
  isForRent: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getPrinters(): Promise<Printer[]> {
  const results = await query<any[]>('SELECT * FROM printers ORDER BY created_at DESC');
  
  return results.map(row => ({
    id: row.id,
    make: row.make,
    model: row.model,
    series: row.series,
    status: row.status,
    ownedBy: row.owned_by,
    assignedTo: row.assigned_to,
    clientId: row.client_id,
    department: row.department,
    location: row.location,
    isForRent: Boolean(row.is_for_rent),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function getPrinterById(id: string): Promise<Printer | null> {
  const results = await query<any[]>('SELECT * FROM printers WHERE id = ?', [id]);
  
  if (results.length === 0) {
    return null;
  }
  
  const row = results[0];
  
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    series: row.series,
    status: row.status,
    ownedBy: row.owned_by,
    assignedTo: row.assigned_to,
    clientId: row.client_id,
    department: row.department,
    location: row.location,
    isForRent: Boolean(row.is_for_rent),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createPrinter(printer: Omit<Printer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Printer> {
  const id = uuidv4();
  
  await query(
    `INSERT INTO printers (
      id, make, model, series, status, owned_by, assigned_to, client_id, 
      department, location, is_for_rent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, printer.make, printer.model, printer.series, printer.status, printer.ownedBy, 
      printer.assignedTo, printer.clientId, printer.department, printer.location, 
      printer.isForRent
    ]
  );
  
  // Get the newly created printer with timestamps
  const created = await getPrinterById(id);
  
  if (!created) {
    throw new Error('Failed to retrieve created printer');
  }
  
  return created;
}

export async function updatePrinter(id: string, updates: Partial<Printer>): Promise<Printer | null> {
  // Get the current printer
  const printer = await getPrinterById(id);
  
  if (!printer) {
    return null;
  }
  
  // Build update query
  const updateFields = [];
  const updateValues = [];
  
  if (updates.make !== undefined) {
    updateFields.push('make = ?');
    updateValues.push(updates.make);
  }
  
  if (updates.model !== undefined) {
    updateFields.push('model = ?');
    updateValues.push(updates.model);
  }
  
  if (updates.series !== undefined) {
    updateFields.push('series = ?');
    updateValues.push(updates.series);
  }
  
  if (updates.status !== undefined) {
    updateFields.push('status = ?');
    updateValues.push(updates.status);
  }
  
  if (updates.ownedBy !== undefined) {
    updateFields.push('owned_by = ?');
    updateValues.push(updates.ownedBy);
  }
  
  if (updates.assignedTo !== undefined) {
    updateFields.push('assigned_to = ?');
    updateValues.push(updates.assignedTo);
  }
  
  if (updates.clientId !== undefined) {
    updateFields.push('client_id = ?');
    updateValues.push(updates.clientId);
  }
  
  if (updates.department !== undefined) {
    updateFields.push('department = ?');
    updateValues.push(updates.department);
  }
  
  if (updates.location !== undefined) {
    updateFields.push('location = ?');
    updateValues.push(updates.location);
  }
  
  if (updates.isForRent !== undefined) {
    updateFields.push('is_for_rent = ?');
    updateValues.push(updates.isForRent);
  }
  
  // Add id to values
  updateValues.push(id);
  
  // Execute update if there are fields to update
  if (updateFields.length > 0) {
    await query(
      `UPDATE printers SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
  }
  
  // Return updated printer
  return getPrinterById(id);
}

export async function deletePrinter(id: string): Promise<boolean> {
  await query<any>('DELETE FROM printers WHERE id = ?', [id]);
  return true;
}

export async function updatePrinterRentalStatus(id: string, isForRent: boolean): Promise<Printer | null> {
  return updatePrinter(id, { isForRent });
}

export async function getPrintersByClientId(clientId: string): Promise<Printer[]> {
  const results = await query<any[]>('SELECT * FROM printers WHERE client_id = ? ORDER BY created_at DESC', [clientId]);
  
  return results.map(row => ({
    id: row.id,
    make: row.make,
    model: row.model,
    series: row.series,
    status: row.status,
    ownedBy: row.owned_by,
    assignedTo: row.assigned_to,
    clientId: row.client_id,
    department: row.department,
    location: row.location,
    isForRent: Boolean(row.is_for_rent),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}
