//do not remove any of these imports
//ensure these are check throughly in each project folders and subfolders
//these components just neededs update or add entry in db if missing or need to fix the interface
//ensure that this components layout,style will not be touched changed or modified
import { useState } from "react";
import { ProductDetailsDialog } from "@/components/products/ProductDetailsDialog";
import { HomeHeader } from "@/components/layout/HomeHeader";
import { HeroSection } from "@/components/home/HeroSection";
import { PopularProductsSection } from "@/components/home/PopularProductsSection";
import { NewReleasesSection } from "@/components/home/NewReleasesSection";
import { PrinterSolutionsSection } from "@/components/home/PrinterSolutionsSection";
import { AboutSection } from "@/components/home/AboutSection";
import { ShopByBrandSection } from "@/components/home/ShopByBrandSection";
import { FAQSection } from "@/components/home/FAQSection";
import { AdditionalInfoSection } from "@/components/home/AdditionalInfoSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { HomeFooter } from "@/components/home/HomeFooter";
import { Toaster } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { StaticSettingsProvider, useStaticSettings } from "@/context/StaticSettingsContext";

// Static product interface
export interface EnhancedTonerType {
  id: string;
  name: string;
  price: number;
  manufacturer: string;
  type: "toner" | "ink" | "other";
  stock: number;
  imageUrl: string;
  category: string;
  brand: string;
  quantityInStock: number;
}

// Static product data - Using original brand names to match HomePage.tsx
const staticProducts: EnhancedTonerType[] = [
  {
    id: "1",
    name: "HP 26A Black Toner",
    price: 1899.99,
    manufacturer: "HP",
    type: "toner",
    stock: 25,
    imageUrl: 'https://placehold.co/200x200/e6f7ff/333?text=HP 26A',
    category: "toner",
    brand: "HP",
    quantityInStock: 25
  },
  {
    id: "2",
    name: "Canon PGI-280 Black Ink",
    price: 1299.99,
    manufacturer: "Canon",
    type: "ink",
    stock: 18,
    imageUrl: 'https://placehold.co/200x200/e6f7ff/333?text=Canon 280',
    category: "ink",
    brand: "Canon",
    quantityInStock: 18
  },
  {
    id: "3",
    name: "Brother TN-760 High Yield Toner",
    price: 1599.99,
    manufacturer: "Brother",
    type: "toner",
    stock: 15,
    imageUrl: 'https://placehold.co/200x200/e6f7ff/333?text=Brother 760',
    category: "toner",
    brand: "Brother",
    quantityInStock: 15
  },
  {
    id: "4",
    name: "Epson 702 Cyan Ink",
    price: 1099.99,
    manufacturer: "Epson",
    type: "ink",
    stock: 30,
    imageUrl: 'https://placehold.co/200x200/e6f7ff/333?text=Epson 702',
    category: "ink",
    brand: "Epson",
    quantityInStock: 30
  },
  {
    id: "5",
    name: "Samsung MLT-D111S Black Toner",
    price: 1799.99,
    manufacturer: "Samsung",
    type: "toner",
    stock: 12,
    imageUrl: 'https://placehold.co/200x200/e6f7ff/333?text=Samsung D111S',
    category: "toner",
    brand: "Samsung",
    quantityInStock: 12
  },
  {
    id: "6",
    name: "Lexmark 71B10K0 Black Toner",
    price: 2199.99,
    manufacturer: "Lexmark",
    type: "toner",
    stock: 8,
    imageUrl: 'https://placehold.co/200x200/e6f7ff/333?text=Lexmark 71B',
    category: "toner",
    brand: "Lexmark",
    quantityInStock: 8
  },
  {
    id: "7",
    name: "Xerox 106R03745 Cyan Toner",
    price: 2299.99,
    manufacturer: "Xerox",
    type: "toner",
    stock: 9,
    imageUrl: 'https://placehold.co/200x200/e6f7ff/333?text=Xerox 106R',
    category: "toner",
    brand: "Xerox",
    quantityInStock: 9
  },
  {
    id: "8",
    name: "HP 63XL Tri-color Ink",
    price: 1499.99,
    manufacturer: "HP",
    type: "ink",
    stock: 22,
    imageUrl: 'https://placehold.co/200x200/e6f7ff/333?text=HP 63XL',
    category: "ink",
    brand: "HP",
    quantityInStock: 22
  }
];

const StoreContent = () => {
  const [selectedProduct, setSelectedProduct] = useState<EnhancedTonerType | null>(null);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  const { settings, isLoading: isLoadingSettings } = useStaticSettings();
  const isMobile = useIsMobile();

  // Get static products for display sections
  const popularProducts = staticProducts.slice(0, 4);
  const newReleases = staticProducts.slice(4, 8);

  // Handle product click 
  const handleProductClick = (product: EnhancedTonerType) => {
    setSelectedProduct(product);
    setIsProductDetailsOpen(true);
  };
  
  // Show a loading skeleton while settings are being loaded
  if (isLoadingSettings) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Skeleton className="h-16 w-full" />
        <main className="flex-1">
          <Skeleton className="h-64 w-full mt-4" />
          <Skeleton className="h-8 w-3/4 mx-auto mt-8 mb-4" />
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-60 w-full" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
      {/* Toast notifications */}
      <Toaster position={isMobile ? "top-center" : "top-right"} />
      
      {/* Use the HomeHeader component */}
      <HomeHeader />

      {/* Hero Section with Slider and Printer Finder */}
      <HeroSection />

      <main className="flex-1">
        {/* Popular Products */}
        <PopularProductsSection 
          products={popularProducts} 
          onViewProductDetails={handleProductClick} 
        />
        
        {/* New Releases */}
        <NewReleasesSection 
          products={newReleases} 
          onProductClick={handleProductClick} 
        />

        {/* Printer Solutions Section (Now uses live Supabase data) */}
        <PrinterSolutionsSection />

        {/* About TechPinoy */}
        <AboutSection />

        {/* Shop by Brand */}
        <ShopByBrandSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Additional information sections */}
        <AdditionalInfoSection />

        {/* Newsletter Signup */}
        <NewsletterSection />
      </main>

      {/* Footer */}
      <HomeFooter />
      
      {/* Product Details Dialog */}
      {selectedProduct && (
        <ProductDetailsDialog
          open={isProductDetailsOpen}
          onOpenChange={setIsProductDetailsOpen}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

// Wrap the store content with StaticSettingsProvider to avoid auth context
const Store = () => (
  <StaticSettingsProvider>
    <StoreContent />
  </StaticSettingsProvider>
);

export default Store;
