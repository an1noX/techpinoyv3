
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Phone, HelpCircle, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { HeaderNavLinks } from "./header/HeaderNavLinks";
import { FloatingNav } from "./FloatingNav";
import { HeaderTopBar } from "./header/HeaderTopBar";


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
  
  // Provide default config if none provided
  const defaultConfig: HeaderConfig = {
    showSearchBar: true,
    showCart: true,
    showAccount: true,
    couponButton: {
      enabled: false,
      text: "View Coupons",
      url: "/coupons"
    }
  };
  
  const headerConfig = { ...defaultConfig, ...config };

  // Define navigation items for mobile sidebar
  const navigationItems = [
    { title: "Home", href: "/" },
    { title: "Products", href: "/products" },
    { title: "About", href: "/about" },
    { title: "Contact", href: "/contact" }
  ];

  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MobileSidebar navigation={navigationItems} />
        
        <Link to="/" className="flex items-center font-semibold">
          {headerConfig.logoUrl ? (
            <img src={headerConfig.logoUrl} alt="Logo" className="h-8 w-auto mr-2" />
          ) : (
            "Acme Corp"
          )}
        </Link>
        
        {headerConfig.showSearchBar && (
          <div className="hidden md:flex flex-1 items-center space-x-2">
            <Input type="search" placeholder="Search..." className="max-w-md" />
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          {headerConfig.couponButton?.enabled && (
            <Button asChild variant="secondary">
              <Link to={headerConfig.couponButton.url || "#"}>
                {headerConfig.couponButton.text || "View Coupons"}
              </Link>
            </Button>
          )}
          
          {headerConfig.showCart && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
              </Link>
            </Button>
          )}
          
          {headerConfig.showAccount && (
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
