import React, { useState, useEffect } from 'react';
import { UserWithRole, UserRole } from '@/types/types';
import { supabase } from '@/integrations/supabase/client';

export function UserRoleManager() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role');
      
      if (error) throw error;
      
      if (data) {
        const typedUsers = data.map(user => ({
          ...user,
          role: user.role as UserRole // Cast to the enum type
        })) as UserWithRole[];
        
        setUsers(typedUsers);
      }
      
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Rest of the component implementation
  return (
    <div>
      {/* Component implementation */}
    </div>
  );
}
