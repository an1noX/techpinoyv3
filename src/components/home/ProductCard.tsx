import { Star, ShoppingCart, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnhancedTonerType } from "@/pages/Store"; // Updated import path
import { toast } from "sonner";

interface ProductCardProps {
  product: EnhancedTonerType;
  onClick: (product: EnhancedTonerType) => void;
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Public cart functionality - store in localStorage
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find((item: any) => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error("Failed to add to cart. Please try again.");
    }
  };
  
  return (
    <div 
      className="product-card h-full flex flex-col overflow-hidden group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
      onClick={() => onClick(product)}
    >
      <div className="p-4 flex flex-col h-full relative">
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full">
            30% OFF
          </span>
        </div>
        <div className="mb-4 flex-grow-0 relative overflow-hidden">
          <img 
            src={product.imageUrl || "https://placehold.co/200x200/e6f7ff/333?text=Toner"}
            alt={product.name}
            className="h-32 w-full object-contain mx-auto transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <div className="flex-grow flex flex-col">
          <h3 className="product-title mb-1 group-hover:text-techblue-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex text-amber-400 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-current" />
            ))}
            <span className="text-gray-600 text-xs ml-1">(29)</span>
          </div>
          <div className="text-green-600 text-xs mb-2 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            <span>{product.quantityInStock > 0 ? 'In Stock' : 'Out of Stock'}</span>
          </div>
          <div className="flex items-baseline mb-3">
            <span className="product-price text-lg font-bold text-black">₱{product.price.toFixed(2)}</span>
            <span className="text-xs text-gray-500 line-through ml-2">₱{(product.price * 1.3).toFixed(2)}</span>
          </div>
          <div className="mt-auto space-y-2">
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onClick(product);
              }}
              variant="outline" 
              size="sm" 
              className="w-full text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-techblue-600 transition-colors"
            >
              View Details
            </Button>
            <Button 
              className="w-full bg-techpinoy-500 hover:bg-techpinoy-600 transition-colors"
              size="sm"
              onClick={handleAddToCart}
              disabled={product.quantityInStock === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              {product.quantityInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
