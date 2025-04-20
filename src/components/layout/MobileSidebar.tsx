
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  HomeIcon, 
  ShoppingCart, 
  Printer, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Package 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function MobileSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const isLoggedIn = !!user;
  
  return (
    <div className="flex flex-col h-full py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Menu</h2>
        
        <div className="space-y-1">
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link to="/">
              <HomeIcon className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
          
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link to="/store">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Store
            </Link>
          </Button>
        </div>
      </div>
      
      {isLoggedIn && (
        <>
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">Management</h2>
            <div className="space-y-1">
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link to="/printers">
                  <Printer className="mr-2 h-4 w-4" />
                  Printers
                </Link>
              </Button>
              
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link to="/rentals">
                  <FileText className="mr-2 h-4 w-4" />
                  Rentals
                </Link>
              </Button>
              
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link to="/clients">
                  <Users className="mr-2 h-4 w-4" />
                  Clients
                </Link>
              </Button>
              
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link to="/toner-products">
                  <Package className="mr-2 h-4 w-4" />
                  Toners
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">Account</h2>
            <div className="space-y-1">
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link to="/profile">
                  <Settings className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </Button>
              
              <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </>
      )}
      
      {!isLoggedIn && (
        <div className="px-3 py-2 mt-auto">
          <Button asChild className="w-full">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
