import React, { useState, useEffect } from 'react';
import { Printer, PrinterStatus, OwnershipType } from '@/types/types';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
}

export function TechnicianAssignmentManager() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .eq('role', 'technician');
      
      if (usersError) throw usersError;
      
      if (usersData) {
        setUsers(usersData as User[]);
      }
      
      // Fetch printers
      const { data: printersData, error: printersError } = await supabase
        .from('printers')
        .select('*');
      
      if (printersError) throw printersError;
      
      if (printersData) {
        // Map database data to Printer type
        const typedPrinters = printersData.map(printer => ({
          ...printer,
          status: printer.status as PrinterStatus,
          owned_by: printer.owned_by as OwnershipType
        })) as Printer[];
        
        setPrinters(typedPrinters);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getUserName = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown';
  };
  
  // Rest of the component implementation
  return (
    <div>
      {/* Component implementation */}
    </div>
  );
}
