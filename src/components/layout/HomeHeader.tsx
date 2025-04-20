import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileSidebar } from './MobileSidebar';
import { Input } from '@/components/ui/input';

interface HeaderConfig {
  logoUrl?: string;
  showSearchBar?: boolean;
  showCart?: boolean;
  showAccount?: boolean;
  couponButton?: {
    enabled: boolean;
    text?: string;
    url?: string;
  };
}

interface HomeHeaderProps {
  config?: HeaderConfig;
}

export function HomeHeader({ config }: HomeHeaderProps) {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-64">
            <MobileSidebar />
          </SheetContent>
        </Sheet>
        
        <Link to="/" className="flex items-center font-semibold">
          {config?.logoUrl ? (
            <img src={config.logoUrl} alt="Logo" className="h-8 w-auto mr-2" />
          ) : (
            "Acme Corp"
          )}
        </Link>
        
        {config?.showSearchBar && (
          <div className="hidden md:flex flex-1 items-center space-x-2">
            <Input type="search" placeholder="Search..." className="max-w-md" />
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          {config?.couponButton?.enabled && (
            <Button asChild variant="secondary">
              <Link to={config.couponButton.url || "#"}>
                {config.couponButton.text || "View Coupons"}
              </Link>
            </Button>
          )}
          
          {config?.showCart && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
              </Link>
            </Button>
          )}
          
          {config?.showAccount && (
            <Button variant="ghost" size="sm" asChild>
              <Link to={isLoggedIn ? "/profile" : "/auth"}>
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
