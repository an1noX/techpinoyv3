
import { query } from './db';
import { v4 as uuidv4 } from 'uuid';

export interface WikiPrinter {
  id: string;
  make: string;
  model: string;
  series: string;
  specs: Record<string, string> | null;
  maintenanceTips: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getWikiPrinters(): Promise<WikiPrinter[]> {
  const results = await query<any[]>('SELECT * FROM printer_wiki ORDER BY make, model');
  
  return results.map(row => ({
    id: row.id,
    make: row.make,
    model: row.model,
    series: row.series,
    specs: row.specs,
    maintenanceTips: row.maintenance_tips,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function getWikiPrinterById(id: string): Promise<WikiPrinter | null> {
  const results = await query<any[]>('SELECT * FROM printer_wiki WHERE id = ?', [id]);
  
  if (results.length === 0) {
    return null;
  }
  
  const row = results[0];
  
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    series: row.series,
    specs: row.specs,
    maintenanceTips: row.maintenance_tips,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createWikiPrinter(printer: Omit<WikiPrinter, 'id' | 'createdAt' | 'updatedAt'>): Promise<WikiPrinter> {
  const id = uuidv4();
  
  await query(
    `INSERT INTO printer_wiki (
      id, make, model, series, specs, maintenance_tips
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id, printer.make, printer.model, printer.series, 
      printer.specs ? JSON.stringify(printer.specs) : null,
      printer.maintenanceTips
    ]
  );
  
  // Get the newly created wiki printer with timestamps
  const created = await getWikiPrinterById(id);
  
  if (!created) {
    throw new Error('Failed to retrieve created wiki printer');
  }
  
  return created;
}

export async function updateWikiPrinter(id: string, updates: Partial<WikiPrinter>): Promise<WikiPrinter | null> {
  // Get the current wiki printer
  const printer = await getWikiPrinterById(id);
  
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
  
  if (updates.specs !== undefined) {
    updateFields.push('specs = ?');
    updateValues.push(updates.specs ? JSON.stringify(updates.specs) : null);
  }
  
  if (updates.maintenanceTips !== undefined) {
    updateFields.push('maintenance_tips = ?');
    updateValues.push(updates.maintenanceTips);
  }
  
  // Add id to values
  updateValues.push(id);
  
  // Execute update if there are fields to update
  if (updateFields.length > 0) {
    await query(
      `UPDATE printer_wiki SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
  }
  
  // Return updated wiki printer
  return getWikiPrinterById(id);
}

export async function deleteWikiPrinter(id: string): Promise<boolean> {
  await query<any>('DELETE FROM printer_wiki WHERE id = ?', [id]);
  return true;
}

export async function searchWikiPrinters(searchTerm: string): Promise<WikiPrinter[]> {
  const results = await query<any[]>(
    `SELECT * FROM printer_wiki 
     WHERE make LIKE ? OR model LIKE ? OR series LIKE ? 
     ORDER BY make, model`,
    [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
  );
  
  return results.map(row => ({
    id: row.id,
    make: row.make,
    model: row.model,
    series: row.series,
    specs: row.specs,
    maintenanceTips: row.maintenance_tips,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}
