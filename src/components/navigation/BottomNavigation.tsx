import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DatabaseIcon, PrinterIcon, CalendarIcon, UserIcon, Users, Package, Settings, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = useMemo(() => [
    { 
      name: 'Wiki', 
      path: '/wiki', 
      icon: DatabaseIcon,
      matchPattern: '/wiki'
    },
    { 
      name: 'Printers', 
      path: '/printers', 
      icon: PrinterIcon 
    },
    { 
      name: 'Products', 
      path: '/toner-products', 
      icon: Package 
    },
    { 
      name: 'Maintenance', 
      path: '/maintenance',
      icon: SlidersHorizontal
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: Settings,
      matchPattern: '/settings'
    },
    { 
      name: 'Rentals', 
      path: '/rentals', 
      icon: CalendarIcon 
    },
    { 
      name: 'Clients', 
      path: '/clients', 
      icon: Users 
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      icon: UserIcon 
    },
  ], []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-sm h-16">
      <nav className="flex h-full">
        {navItems.map((item) => {
          const isActive = item.matchPattern
            ? currentPath.startsWith(item.matchPattern)
            : currentPath === item.path;
            
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex-1 flex flex-col items-center justify-center",
                "transition-colors duration-200",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon size={24} className={cn(
                "mb-1",
                isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"
              )} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
