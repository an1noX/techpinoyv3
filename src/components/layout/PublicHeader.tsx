
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";
import { HeaderTopBar } from "./header/HeaderTopBar";
import { SearchBar } from "./header/SearchBar";
import { HeaderNavLinks } from "./header/HeaderNavLinks";
import { AccountSection } from "./header/AccountSection";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FloatingNav } from "./FloatingNav";
import { AuthProvider } from "@/context/AuthContext";

export function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const isLoginPage = location.pathname === "/login";
  const isHomePage = location.pathname === "/";

  // If we're on the home page, don't render the navbar since we're using HomeHeader directly
  if (isHomePage) {
    return null;
  }

  const logoImage = "/lovable-uploads/f704ae41-80a6-4886-ad69-a09b71748616.png";

  return (
    <>
      <header className="bg-white sticky top-0 z-30 shadow-sm">
        {/* Top notification bar */}
        <HeaderTopBar />
        
        {/* Main header */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img 
                src={logoImage}
                alt="TechPinoy" 
                className="h-12 w-auto" 
              />
            </Link>
            
            {/* Search form */}
            <SearchBar />
            
            {/* Account & Cart */}
            <div className="flex items-center space-x-4">
              <AccountSection />
              
              {/* Mobile menu button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="md:hidden"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-[300px] bg-teal-800 text-white">
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-teal-700">
                      <h2 className="text-xl font-semibold">Menu</h2>
                    </div>
                    <div className="flex-1 overflow-auto">
                      <HeaderNavLinks isMobile={true} />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        
        {/* Navigation menu - Desktop only */}
        <nav className="hidden md:block border-t border-gray-200">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-2">
            <div className="container mx-auto">
              <HeaderNavLinks isMobile={false} />
            </div>
          </div>
        </nav>
      </header>

      {/* Add the FloatingNav for mobile */}
      <div className="md:hidden">
        <AuthProvider>
          <FloatingNav />
        </AuthProvider>
      </div>
    </>
  );
}
