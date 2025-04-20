
import { Link } from "react-router-dom";
import { ShoppingCart, Printer, Package, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface HeaderNavLinksProps {
  isMobile: boolean;
}

export function HeaderNavLinks({ isMobile }: HeaderNavLinksProps) {
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  // Mobile-specific navigation - simplified as requested
  if (isMobile) {
    return (
      <ul className="flex flex-col w-full space-y-4 py-2">
        {isAuthenticated ? (
          <li className="flex items-center space-x-2 px-4">
            <LogOut className="h-5 w-5" />
            <button onClick={handleLogout} className="hover:text-yellow-300 font-medium">Logout</button>
          </li>
        ) : (
          <li className="flex items-center space-x-2 px-4">
            <User className="h-5 w-5" />
            <Link to="/auth" className="hover:text-yellow-300 font-medium">Login</Link>
          </li>
        )}
        <li className="flex items-center space-x-2 px-4">
          <ShoppingCart className="h-5 w-5" />
          <Link to="/cart" className="hover:text-yellow-300 font-medium">Cart</Link>
        </li>
        <li className="flex items-center space-x-2 px-4">
          <Package className="h-5 w-5" />
          <Link to="/products" className="hover:text-yellow-300 font-medium">Products</Link>
        </li>
      </ul>
    );
  }

  // Desktop navigation (keep existing) 
  return (
    <ul className="flex flex-row items-center space-x-8">
      <li>
        <Link to="/products?brand=hp" className="hover:text-yellow-300 font-medium">HP</Link>
      </li>
      <li>
        <Link to="/products?brand=brother" className="hover:text-yellow-300 font-medium">Brother</Link>
      </li>
      <li>
        <Link to="/products?brand=canon" className="hover:text-yellow-300 font-medium">Canon</Link>
      </li>
      <li>
        <Link to="/products?brand=xerox" className="hover:text-yellow-300 font-medium">Xerox</Link>
      </li>
      <li>
        <Link to="/products?brand=samsung" className="hover:text-yellow-300 font-medium">Samsung</Link>
      </li>
      <li>
        <Link to="/products?brand=other" className="hover:text-yellow-300 font-medium">Other Brands</Link>
      </li>
      <li>
        <Link to="/blogs" className="hover:text-yellow-300 font-medium">Blogs</Link>
      </li>
      <li>
        <Link to="/contact" className="hover:text-yellow-300 font-medium">Contact Us</Link>
      </li>
    </ul>
  );
}
