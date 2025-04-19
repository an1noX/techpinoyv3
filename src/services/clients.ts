
import { query } from './db';
import { v4 as uuidv4 } from 'uuid';

export interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getClients(): Promise<Client[]> {
  const results = await query<any[]>('SELECT * FROM clients ORDER BY created_at DESC');
  
  return results.map(row => ({
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    address: row.address,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function getClientById(id: string): Promise<Client | null> {
  const results = await query<any[]>('SELECT * FROM clients WHERE id = ?', [id]);
  
  if (results.length === 0) {
    return null;
  }
  
  const row = results[0];
  
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    address: row.address,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
  const id = uuidv4();
  
  await query(
    `INSERT INTO clients (
      id, name, company, email, phone, address, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id, client.name, client.company, client.email, client.phone, client.address, client.notes
    ]
  );
  
  // Get the newly created client with timestamps
  const created = await getClientById(id);
  
  if (!created) {
    throw new Error('Failed to retrieve created client');
  }
  
  return created;
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
  // Get the current client
  const client = await getClientById(id);
  
  if (!client) {
    return null;
  }
  
  // Build update query
  const updateFields = [];
  const updateValues = [];
  
  if (updates.name !== undefined) {
    updateFields.push('name = ?');
    updateValues.push(updates.name);
  }
  
  if (updates.company !== undefined) {
    updateFields.push('company = ?');
    updateValues.push(updates.company);
  }
  
  if (updates.email !== undefined) {
    updateFields.push('email = ?');
    updateValues.push(updates.email);
  }
  
  if (updates.phone !== undefined) {
    updateFields.push('phone = ?');
    updateValues.push(updates.phone);
  }
  
  if (updates.address !== undefined) {
    updateFields.push('address = ?');
    updateValues.push(updates.address);
  }
  
  if (updates.notes !== undefined) {
    updateFields.push('notes = ?');
    updateValues.push(updates.notes);
  }
  
  // Add id to values
  updateValues.push(id);
  
  // Execute update if there are fields to update
  if (updateFields.length > 0) {
    await query(
      `UPDATE clients SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
  }
  
  // Return updated client
  return getClientById(id);
}

export async function deleteClient(id: string): Promise<boolean> {
  await query<any>('DELETE FROM clients WHERE id = ?', [id]);
  return true;
}

export async function assignPrinterToClient(clientId: string, printerId: string, notes?: string): Promise<boolean> {
  const id = uuidv4();
  const now = new Date().toISOString();
  
  await query(
    `INSERT INTO printer_client_assignments (
      id, printer_id, client_id, assigned_at, notes
    ) VALUES (?, ?, ?, ?, ?)`,
    [id, printerId, clientId, now, notes || null]
  );
  
  // Also update the printer's client_id
  await query(
    `UPDATE printers SET client_id = ? WHERE id = ?`,
    [clientId, printerId]
  );
  
  return true;
}

export async function getClientWithPrinters(clientId: string): Promise<{ client: Client, printers: any[] }> {
  const client = await getClientById(clientId);
  
  if (!client) {
    throw new Error('Client not found');
  }
  
  const printers = await query<any[]>(
    `SELECT p.* 
     FROM printers p
     WHERE p.client_id = ?`,
    [clientId]
  );
  
  return {
    client,
    printers: printers.map(p => ({
      id: p.id,
      make: p.make,
      model: p.model,
      status: p.status,
      location: p.location
    }))
  };
}
