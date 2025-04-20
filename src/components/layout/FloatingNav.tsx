import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, User, LogOut, ArrowUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";  // Updated import

export function FloatingNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Handle scroll events to show/hide the scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-end gap-2">
      {/* Navigation Floating Bubble */}
      <div className="flex flex-col gap-2 p-3 bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl shadow-lg">
        {isAuthenticated ? (
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-teal-500 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-teal-500 hover:text-white"
            asChild
          >
            <Link to="/login">
              <User className="h-5 w-5" />
              <span className="sr-only">Login</span>
            </Link>
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-teal-500 hover:text-white"
          asChild
        >
          <Link to="/cart">
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Cart</span>
          </Link>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-teal-500 hover:text-white" 
          asChild
        >
          <Link to="/products">
            <Package className="h-5 w-5" />
            <span className="sr-only">Products</span>
          </Link>
        </Button>
      </div>
      
      {/* Scroll to Top Button - Only visible when scrolled */}
      {isScrolled && (
        <Button 
          onClick={scrollToTop} 
          variant="outline" 
          size="icon" 
          className="bg-white text-teal-600 border-teal-200 hover:bg-teal-50 rounded-full shadow-md"
        >
          <ArrowUp className="h-5 w-5" />
          <span className="sr-only">Scroll to top</span>
        </Button>
      )}
    </div>
  );
}
