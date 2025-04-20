
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, ShoppingCart, PackageCheck, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UserProfile } from "@/components/auth/UserProfile";

export function AccountSection() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/products')}
          className="text-gray-600"
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          Products
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout} 
          className="text-gray-600 hover:text-red-500 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Logout
        </Button>
        <UserProfile />
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center space-x-6">
      <div className="flex flex-col items-center">
        <PackageCheck className="h-5 w-5 text-cyan-600" />
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-600">Quick Reorder</span>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <PackageCheck className="h-5 w-5 text-cyan-600" />
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-600">Track Order</span>
        </div>
      </div>
      
      <Link to="/login" className="flex flex-col items-center">
        <User className="h-5 w-5 text-cyan-600" />
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-600">Account</span>
        </div>
      </Link>
      
      <Link to="/cart" className="flex flex-col items-center relative">
        <ShoppingCart className="h-5 w-5 text-cyan-600" />
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-600">Cart (0)</span>
        </div>
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
      </Link>
    </div>
  );
}
