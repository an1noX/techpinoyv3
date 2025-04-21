
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
        .select(`
          id,
          first_name,
          last_name,
          role
        `);
      
      if (error) {
        throw error;
      }
      
      // Ensure we have proper UserRole type
      const validateUserRole = (role: string): UserRole => {
        const validRoles: UserRole[] = ['admin', 'user', 'technician', 'client'];
        return validRoles.includes(role as UserRole) ? (role as UserRole) : 'user';
      };
      
      const usersList: UserWithRole[] = data?.map(profile => ({
        id: profile.id,
        email: '', // This won't be available without accessing auth.users
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: validateUserRole(profile.role),
        // Add frontend compatibility fields
        firstName: profile.first_name,
        lastName: profile.last_name
      })) || [];
      
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {/* Component implementation */}
    </div>
  );
}
