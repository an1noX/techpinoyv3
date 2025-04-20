import { Button } from "@/components/ui/button";
import { EnhancedTonerType } from "@/pages/Store";
import { ProductCard } from "./ProductCard";

interface NewReleasesSectionProps {
  products: EnhancedTonerType[];
  onProductClick: (product: EnhancedTonerType) => void;
}

export const NewReleasesSection: React.FC<NewReleasesSectionProps> = ({ products, onProductClick }) => {
  return (
    <div className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Newly Released Printer Ink, Toner & Drum Cartridges
          </h2>
          <Button 
            variant="link" 
            className="text-techblue-600 hover:text-techblue-800 font-medium flex items-center"
            onClick={() => window.location.href = "/products/new"}
          >
            View All
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={onProductClick} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
