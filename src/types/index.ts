
// Update Rental type to match actual database schema
export interface Rental {
  id: string;
  printerId: string | null;
  clientId: string | null;
  client: string;
  printer: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled' | 'upcoming';
  signatureUrl?: string | null;
  agreementUrl?: string | null;
}
