
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Printer, Database, Settings, Layout, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const BottomNavigation = () => {
  const location = useLocation();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin') || hasRole('owner');
  const [counts, setCounts] = useState({
    printers: 0,
    clients: 0,
    toners: 0
  });
  
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch counts from Supabase
        const [
          printersResponse, 
          clientsResponse, 
          tonersResponse
        ] = await Promise.all([
          supabase.from('printers').select('id', { count: 'exact', head: true }),
          supabase.from('clients').select('id', { count: 'exact', head: true }),
          supabase.from('toner_models').select('id', { count: 'exact', head: true })
        ]);

        setCounts({
          printers: printersResponse.count || 0,
          clients: clientsResponse.count || 0,
          toners: tonersResponse.count || 0
        });
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    if (isAdmin) {
      fetchCounts();
    }
  }, [isAdmin]);
  
  const navItems = [
    {
      title: 'Dashboard',
      icon: <Layout className="h-5 w-5" />,
      href: '/dashboard',
      active: location.pathname === '/dashboard',
      badge: null
    },
    {
      title: 'Printers',
      icon: <Printer className="h-5 w-5" />,
      href: '/dashboard/printers',
      active: location.pathname === '/dashboard/printers',
      badge: counts.printers
    },
  ];
  
  if (isAdmin) {
    navItems.push(
      {
        title: 'Clients',
        icon: <Building2 className="h-5 w-5" />,
        href: '/admin/clients',
        active: location.pathname === '/admin/clients',
        badge: counts.clients
      },
      {
        title: 'Users',
        icon: <Users className="h-5 w-5" />,
        href: '/admin/users',
        active: location.pathname === '/admin/users',
        badge: null
      },
      {
        title: 'Inventory',
        icon: <Database className="h-5 w-5" />,
        href: '/admin/toners',
        active: location.pathname === '/admin/toners',
        badge: counts.toners
      },
      {
        title: 'Settings',
        icon: <Settings className="h-5 w-5" />,
        href: '/admin/settings',
        active: location.pathname === '/admin/settings',
        badge: null
      }
    );
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden z-10">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full px-2 relative",
              item.active ? "text-primary" : "text-muted-foreground"
            )}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.title}</span>
            {item.badge !== null && item.badge > 0 && (
              <span className="absolute top-0 right-1/4 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
