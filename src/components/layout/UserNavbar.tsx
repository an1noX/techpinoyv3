
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "@/components/auth/UserProfile";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, ShoppingCart, User, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function UserNavbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isLoginPage = location.pathname === "/login";
  const isHomePage = location.pathname === "/";
  const isAuthenticated = !!user;
  const isAdmin = true; // For testing purposes we'll assume admin role
  
  const handleLoginClick = () => {
    navigate("/auth");
  };
  
  const handleLogout = () => {
    signOut();
    navigate('/');
  };
  
  // Don't render the navbar on the homepage or public product pages
  if (isHomePage || location.pathname.includes("/products") || location.pathname.includes("/brands") || location.pathname.includes("/printers/")) {
    return null;
  }
  
  return (
    <div className="fixed top-0 left-0 right-0 border-b border-gray-200 bg-card text-card-foreground z-10 px-4 h-14 flex items-center justify-between">
      <div className="text-xl font-bold text-techblue-700 cursor-pointer" onClick={() => navigate('/dashboard')}>
        TechPinoy Dashboard
      </div>
      
      {isAuthenticated ? (
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {isAdmin && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="text-foreground"
            >
              <LayoutDashboard className="h-4 w-4 mr-1" />
              Admin
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/products')}
            className="text-foreground"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Store
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout} 
            className="text-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
          <UserProfile />
        </div>
      ) : (
        !isLoginPage && (
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLoginClick} 
              className="border-techblue-600 text-techblue-600 hover:bg-techblue-50 hover:text-techblue-700 dark:border-techblue-400 dark:text-techblue-400 dark:hover:bg-techblue-950/30"
            >
              <LogIn className="h-4 w-4 mr-1" />
              Login
            </Button>
          </div>
        )
      )}
    </div>
  );
}
