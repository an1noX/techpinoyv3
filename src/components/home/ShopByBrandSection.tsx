
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

// Brand type
export interface Brand {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
}

// Static featured brands data
const staticBrands: Brand[] = [
  {
    id: '1',
    name: 'HP',
    logo_url: 'https://placehold.co/200x100/e6f7ff/333?text=HP',
    website_url: '/brands/hp'
  },
  {
    id: '2',
    name: 'Canon',
    logo_url: 'https://placehold.co/200x100/e6f7ff/333?text=Canon',
    website_url: '/brands/canon'
  },
  {
    id: '3',
    name: 'Brother',
    logo_url: 'https://placehold.co/200x100/e6f7ff/333?text=Brother',
    website_url: '/brands/brother'
  },
  {
    id: '4',
    name: 'Epson',
    logo_url: 'https://placehold.co/200x100/e6f7ff/333?text=Epson',
    website_url: '/brands/epson'
  },
  {
    id: '5',
    name: 'Samsung',
    logo_url: 'https://placehold.co/200x100/e6f7ff/333?text=Samsung',
    website_url: '/brands/samsung'
  },
  {
    id: '6',
    name: 'Lexmark',
    logo_url: 'https://placehold.co/200x100/e6f7ff/333?text=Lexmark',
    website_url: '/brands/lexmark'
  },
  {
    id: '7',
    name: 'Xerox',
    logo_url: 'https://placehold.co/200x100/e6f7ff/333?text=Xerox',
    website_url: '/brands/xerox'
  },
  {
    id: '8',
    name: 'Kyocera',
    logo_url: 'https://placehold.co/200x100/e6f7ff/333?text=Kyocera',
    website_url: '/brands/kyocera'
  }
];

export const ShopByBrandSection = () => {
  const isMobile = useIsMobile();
  const featuredBrands = staticBrands;
  
  const handleBrandClick = (brandName: string) => {
    // Show a toast notification since these are static links
    toast.info(`Viewing ${brandName} products`, {
      description: "This is a demo with static data",
      duration: 3000,
    });
  };
  
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold mb-8 text-center text-gray-800">
          Shop Printer Ink, Toner & Drum Cartridges by Printer Brand
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featuredBrands.slice(0, 4).map(brand => (
            <Link 
              key={brand.id}
              to={brand.website_url}
              className="bg-white border border-gray-200 hover:border-techblue-300 hover:shadow-md transition-all duration-300 flex flex-col items-center p-6 rounded-xl group"
              onClick={(e) => {
                e.preventDefault();
                handleBrandClick(brand.name);
              }}
            >
              <div className="p-4 bg-gray-50 rounded-full mb-4 group-hover:bg-blue-50 transition-colors">
                <img 
                  src={brand.logo_url}
                  alt={brand.name}
                  className="h-10 w-auto object-contain"
                />
              </div>
              <Button className="bg-techblue-600 hover:bg-techblue-700 w-full transition-colors">
                View Products
              </Button>
            </Link>
          ))}
        </div>
        
        {/* Additional smaller brands on larger screens */}
        {!isMobile && featuredBrands.length > 4 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-6 gap-4">
            {featuredBrands.slice(4).map(brand => (
              <Link 
                key={brand.id}
                to={brand.website_url}
                className="bg-white border border-gray-100 hover:border-gray-300 transition-all duration-300 flex flex-col items-center p-3 rounded-lg"
                onClick={(e) => {
                  e.preventDefault();
                  handleBrandClick(brand.name);
                }}
              >
                <img 
                  src={brand.logo_url}
                  alt={brand.name}
                  className="h-6 w-auto object-contain mb-2"
                />
                <span className="text-xs text-gray-600 hover:text-techblue-600 transition-colors">View Products</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
