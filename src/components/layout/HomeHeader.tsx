import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Phone, HelpCircle, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { HeaderNavLinks } from "./header/HeaderNavLinks";
import { FloatingNav } from "./FloatingNav";
import { HeaderTopBar } from "./header/HeaderTopBar";


export function HomeHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  return (
    <>
      <HeaderTopBar />

      <header className="bg-white py-4 border-b sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0">
              <Link to="/">
                <img 
                  src={headerConfig.logo || "https://techpinoy.net/lovable-uploads/f704ae41-80a6-4886-ad69-a09b71748616.png"} 
                  alt="TechPinoy" 
                  className="h-12" 
                />
              </Link>
            </div>
            
            <div className="hidden md:flex flex-grow mx-6 max-w-2xl">
              <form onSubmit={handleSearch} className="flex w-full">
                <Input
                  type="text"
                  placeholder={headerConfig.searchPlaceholder || "Search by Printer Model, Cartridge # or Keywords..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow rounded-r-none border-r-0 focus:ring-teal-500 focus:border-teal-500"
                />
                <Button type="submit" className="bg-teal-500 hover:bg-teal-600 rounded-l-none">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              {headerConfig.showContactSection !== false && (
                <Link to="/contact" className="flex flex-col items-center">
                  <Phone className="h-5 w-5 text-teal-500" />
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-600">Contact Us</span>
                  </div>
                </Link>
              )}
              
              {headerConfig.showHelpSection !== false && (
                <Link to="/help" className="flex flex-col items-center">
                  <HelpCircle className="h-5 w-5 text-teal-500" />
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-600">Help</span>
                  </div>
                </Link>
              )}
              
              {headerConfig.showCart !== false && (
                <Link to="/cart" className="flex flex-col items-center relative">
                  <ShoppingCart className="h-5 w-5 text-teal-500" />
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-600">Cart</span>
                  </div>
                </Link>
              )}
            </div>
            
            <div className="flex items-center space-x-2 md:hidden">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/search')}
              >
                <Search className="h-6 w-6" />
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
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
      </header>
      
      <nav className="hidden md:block">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
          <div className="container mx-auto">
            <ul className="flex flex-row items-center">
              {headerConfig.navigationLinks?.map((link, index) => (
                <li key={index} className={index === 0 ? "pr-6 py-3" : "px-6 py-3"}>
                  <Link to={link.link} className="text-white hover:text-yellow-300 font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
              
              {headerConfig.couponButton?.enabled && (
                <li className="ml-auto py-3">
                  <Link 
                    to={headerConfig.couponButton.link || "/coupons"} 
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-1 rounded-sm flex items-center"
                  >
                    <span className="mr-1">🎟️</span>
                    {headerConfig.couponButton.text || "COUPONS"}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <div className="md:hidden">
        <AuthProvider>
          <FloatingNav />
        </AuthProvider>
      </div>
    </>
  );
}
