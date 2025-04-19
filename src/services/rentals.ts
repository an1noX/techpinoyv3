
import { query } from './db';
import { v4 as uuidv4 } from 'uuid';

export interface Rental {
  id: string;
  printerId: string | null;
  printer: string;
  clientId: string | null;
  client: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled' | 'upcoming';
  agreementUrl: string | null;
  signatureUrl: string | null;
  bookingCount: number | null;
  inquiryCount: number | null;
  nextAvailableDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RentalOption {
  id: string;
  printerId: string;
  rentalRate: number;
  rateUnit: 'hourly' | 'daily' | 'weekly' | 'monthly';
  minimumDuration: number;
  durationUnit: 'hours' | 'days' | 'weeks' | 'months';
  securityDeposit: number;
  terms: string | null;
  cancellationPolicy: string | null;
  availability: string[] | null;
  isForRent: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getRentals(): Promise<Rental[]> {
  const results = await query<any[]>('SELECT * FROM rentals ORDER BY start_date DESC');
  
  return results.map(row => ({
    id: row.id,
    printerId: row.printer_id,
    printer: row.printer,
    clientId: row.client_id,
    client: row.client,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    agreementUrl: row.agreement_url,
    signatureUrl: row.signature_url,
    bookingCount: row.booking_count,
    inquiryCount: row.inquiry_count,
    nextAvailableDate: row.next_available_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function getRentalById(id: string): Promise<Rental | null> {
  const results = await query<any[]>('SELECT * FROM rentals WHERE id = ?', [id]);
  
  if (results.length === 0) {
    return null;
  }
  
  const row = results[0];
  
  return {
    id: row.id,
    printerId: row.printer_id,
    printer: row.printer,
    clientId: row.client_id,
    client: row.client,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    agreementUrl: row.agreement_url,
    signatureUrl: row.signature_url,
    bookingCount: row.booking_count,
    inquiryCount: row.inquiry_count,
    nextAvailableDate: row.next_available_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createRental(rental: Omit<Rental, 'id' | 'createdAt' | 'updatedAt'>): Promise<Rental> {
  const id = uuidv4();
  
  await query(
    `INSERT INTO rentals (
      id, printer_id, printer, client_id, client, start_date, end_date, 
      status, agreement_url, signature_url, booking_count, inquiry_count, next_available_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, rental.printerId, rental.printer, rental.clientId, rental.client, 
      rental.startDate, rental.endDate, rental.status, rental.agreementUrl, 
      rental.signatureUrl, rental.bookingCount, rental.inquiryCount, rental.nextAvailableDate
    ]
  );
  
  // Get the newly created rental with timestamps
  const created = await getRentalById(id);
  
  if (!created) {
    throw new Error('Failed to retrieve created rental');
  }
  
  return created;
}

export async function updateRental(id: string, updates: Partial<Rental>): Promise<Rental | null> {
  // Get the current rental
  const rental = await getRentalById(id);
  
  if (!rental) {
    return null;
  }
  
  // Build update query
  const updateFields = [];
  const updateValues = [];
  
  if (updates.printerId !== undefined) {
    updateFields.push('printer_id = ?');
    updateValues.push(updates.printerId);
  }
  
  if (updates.printer !== undefined) {
    updateFields.push('printer = ?');
    updateValues.push(updates.printer);
  }
  
  if (updates.clientId !== undefined) {
    updateFields.push('client_id = ?');
    updateValues.push(updates.clientId);
  }
  
  if (updates.client !== undefined) {
    updateFields.push('client = ?');
    updateValues.push(updates.client);
  }
  
  if (updates.startDate !== undefined) {
    updateFields.push('start_date = ?');
    updateValues.push(updates.startDate);
  }
  
  if (updates.endDate !== undefined) {
    updateFields.push('end_date = ?');
    updateValues.push(updates.endDate);
  }
  
  if (updates.status !== undefined) {
    updateFields.push('status = ?');
    updateValues.push(updates.status);
  }
  
  if (updates.agreementUrl !== undefined) {
    updateFields.push('agreement_url = ?');
    updateValues.push(updates.agreementUrl);
  }
  
  if (updates.signatureUrl !== undefined) {
    updateFields.push('signature_url = ?');
    updateValues.push(updates.signatureUrl);
  }
  
  if (updates.bookingCount !== undefined) {
    updateFields.push('booking_count = ?');
    updateValues.push(updates.bookingCount);
  }
  
  if (updates.inquiryCount !== undefined) {
    updateFields.push('inquiry_count = ?');
    updateValues.push(updates.inquiryCount);
  }
  
  if (updates.nextAvailableDate !== undefined) {
    updateFields.push('next_available_date = ?');
    updateValues.push(updates.nextAvailableDate);
  }
  
  // Add id to values
  updateValues.push(id);
  
  // Execute update if there are fields to update
  if (updateFields.length > 0) {
    await query(
      `UPDATE rentals SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
  }
  
  // Return updated rental
  return getRentalById(id);
}

export async function deleteRental(id: string): Promise<boolean> {
  await query<any>('DELETE FROM rentals WHERE id = ?', [id]);
  return true;
}

export async function getRentalOptions(printerId: string): Promise<RentalOption | null> {
  const results = await query<any[]>('SELECT * FROM rental_options WHERE printer_id = ?', [printerId]);
  
  if (results.length === 0) {
    return null;
  }
  
  const row = results[0];
  
  return {
    id: row.id,
    printerId: row.printer_id,
    rentalRate: row.rental_rate,
    rateUnit: row.rate_unit,
    minimumDuration: row.minimum_duration,
    durationUnit: row.duration_unit,
    securityDeposit: row.security_deposit,
    terms: row.terms,
    cancellationPolicy: row.cancellation_policy,
    availability: row.availability ? JSON.parse(row.availability) : null,
    isForRent: Boolean(row.is_for_rent),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createRentalOptions(options: Omit<RentalOption, 'id' | 'createdAt' | 'updatedAt'>): Promise<RentalOption> {
  const id = uuidv4();
  
  await query(
    `INSERT INTO rental_options (
      id, printer_id, rental_rate, rate_unit, minimum_duration, duration_unit,
      security_deposit, terms, cancellation_policy, availability, is_for_rent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, options.printerId, options.rentalRate, options.rateUnit, options.minimumDuration,
      options.durationUnit, options.securityDeposit, options.terms, options.cancellationPolicy,
      options.availability ? JSON.stringify(options.availability) : null, options.isForRent
    ]
  );
  
  // Get the newly created options
  const results = await query<any[]>('SELECT * FROM rental_options WHERE id = ?', [id]);
  
  if (results.length === 0) {
    throw new Error('Failed to retrieve created rental options');
  }
  
  const row = results[0];
  
  return {
    id: row.id,
    printerId: row.printer_id,
    rentalRate: row.rental_rate,
    rateUnit: row.rate_unit,
    minimumDuration: row.minimum_duration,
    durationUnit: row.duration_unit,
    securityDeposit: row.security_deposit,
    terms: row.terms,
    cancellationPolicy: row.cancellation_policy,
    availability: row.availability ? JSON.parse(row.availability) : null,
    isForRent: Boolean(row.is_for_rent),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function updateRentalOptions(printerId: string, updates: Partial<RentalOption>): Promise<RentalOption | null> {
  // Build update query
  const updateFields = [];
  const updateValues = [];
  
  if (updates.rentalRate !== undefined) {
    updateFields.push('rental_rate = ?');
    updateValues.push(updates.rentalRate);
  }
  
  if (updates.rateUnit !== undefined) {
    updateFields.push('rate_unit = ?');
    updateValues.push(updates.rateUnit);
  }
  
  if (updates.minimumDuration !== undefined) {
    updateFields.push('minimum_duration = ?');
    updateValues.push(updates.minimumDuration);
  }
  
  if (updates.durationUnit !== undefined) {
    updateFields.push('duration_unit = ?');
    updateValues.push(updates.durationUnit);
  }
  
  if (updates.securityDeposit !== undefined) {
    updateFields.push('security_deposit = ?');
    updateValues.push(updates.securityDeposit);
  }
  
  if (updates.terms !== undefined) {
    updateFields.push('terms = ?');
    updateValues.push(updates.terms);
  }
  
  if (updates.cancellationPolicy !== undefined) {
    updateFields.push('cancellation_policy = ?');
    updateValues.push(updates.cancellationPolicy);
  }
  
  if (updates.availability !== undefined) {
    updateFields.push('availability = ?');
    updateValues.push(updates.availability ? JSON.stringify(updates.availability) : null);
  }
  
  if (updates.isForRent !== undefined) {
    updateFields.push('is_for_rent = ?');
    updateValues.push(updates.isForRent);
  }
  
  // Add printer_id to values
  updateValues.push(printerId);
  
  // Execute update if there are fields to update
  if (updateFields.length > 0) {
    const results = await query<any[]>('SELECT id FROM rental_options WHERE printer_id = ?', [printerId]);
    
    if (results.length === 0) {
      // No existing options, create new one
      return createRentalOptions({
        printerId,
        rentalRate: updates.rentalRate ?? 0,
        rateUnit: updates.rateUnit ?? 'daily',
        minimumDuration: updates.minimumDuration ?? 1,
        durationUnit: updates.durationUnit ?? 'days',
        securityDeposit: updates.securityDeposit ?? 0,
        terms: updates.terms ?? null,
        cancellationPolicy: updates.cancellationPolicy ?? null,
        availability: updates.availability ?? null,
        isForRent: updates.isForRent ?? true
      });
    } else {
      // Update existing
      await query(
        `UPDATE rental_options SET ${updateFields.join(', ')} WHERE printer_id = ?`,
        updateValues
      );
    }
  }
  
  // Return updated options
  return getRentalOptions(printerId);
}
