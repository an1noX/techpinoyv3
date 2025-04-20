
import { Link } from "react-router-dom";
import { Phone } from "lucide-react";

export function HeaderTopBar() {
  // Static phone number
  const phone = "(844) 539-3319";

  // Helper function to display the phone with proper click-to-call functionality
  const renderPhone = () => {
    return (
      <a href={`tel:${phone}`} className="hover:underline">
        {phone}
      </a>
    );
  };

  return (
    <div className="bg-teal-800 text-white py-2 px-4 text-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <span className="mr-2">🎁</span>
          <span>Free Shipping Over ₱3,000 | Subscribe For Discount</span>
        </div>
        <div className="hidden md:flex items-center space-x-2">
          <span>Need Help? Call</span>
          {renderPhone()}
          
          <span>or</span>
          
          <a href="#" className="hover:underline flex items-center">
            <span className="mr-1">💬</span>
            <span>Live Chat</span>
          </a>
          
          <span>|</span>
          <Link 
            to="/special-offer" 
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-2 py-0.5 rounded-sm text-xs font-bold"
          >
            Special Offer
          </Link>
        </div>
      </div>
    </div>
  );
}
