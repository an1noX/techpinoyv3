
import { useState, useEffect } from "react";
import { ProductDetailsDialog } from "@/components/products/ProductDetailsDialog";
import { HomeHeader } from "@/components/layout/HomeHeader";
import { HeroSection } from "@/components/home/HeroSection";
import { PopularProductsSection } from "@/components/home/PopularProductsSection";
import { NewReleasesSection } from "@/components/home/NewReleasesSection";
import { PrinterSolutionsSection } from "@/components/home/PrinterSolutionsSection";
import { VideoAds1 } from "@/components/home/VideoAds1";
import { ShopByBrandSection } from "@/components/home/ShopByBrandSection";
import { FAQSection } from "@/components/home/FAQSection";
import { AdditionalInfoSection } from "@/components/home/AdditionalInfoSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { HomeFooter } from "@/components/home/HomeFooter";
import { Toaster, toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { StaticSettingsProvider } from "@/context/SettingsContext";
import { useSettings } from "@/context/SettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { seedTonerProducts } from "@/utils/seedToners";
import { Product } from "@/types/types";

// Enhanced static product interface, now matching the DB
export interface EnhancedTonerType extends Product {
  manufacturer?: string;
  type?: "toner" | "ink" | "other";
  stock: number;
  sold_count?: number;
  created_at?: string;
  sku?: string;
}

// Map DB item to EnhancedTonerType
const mapDbToToner = (item: any): EnhancedTonerType => ({
  id: item.id,
  name: item.name,
  price: Number(item.price),
  manufacturer: item.toner?.brand ?? item.brand ?? "",
  type: Array.isArray(item.category) && item.category[0] ? item.category[0] : "toner",
  stock: item.stock_level ?? 0,
  imageUrl: item.image_url || "https://placehold.co/200x200/e6f7ff/333?text=Toner",
  category: Array.isArray(item.category) && item.category.length > 0 ? item.category[0] : "",
  brand: item.toner?.brand || item.brand || "",
  quantityInStock: item.stock_level ?? 0,
  description: item.description ?? "",
  sold_count: item.sold_count ?? 0,
  created_at: item.created_at,
  sku: item.sku,
});

const StoreContent = () => {
  const [selectedProduct, setSelectedProduct] = useState<EnhancedTonerType | null>(null);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  const { settings, isLoading: isLoadingSettings } = useSettings();
  const isMobile = useIsMobile();

  // Store products state
  const [products, setProducts] = useState<EnhancedTonerType[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch products from DB on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        // Seed products if needed (for development)
        await seedTonerProducts();
        
        // Fetch from commercial_toner_products table
        const { data, error } = await supabase
          .from("commercial_toner_products")
          .select(`
            *,
            toner:toner_id (
              brand
            )
          `)
          .order("created_at", { ascending: false });
        if (error) throw error;

        // Map for the UI
        const mapped = (data ?? []).map(mapDbToToner);
        setProducts(mapped);
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to fetch products");
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Most sold products for Popular section - sort by sold_count
  const popularProducts = [...products]
    .sort((a, b) => (b.sold_count ?? 0) - (a.sold_count ?? 0))
    .slice(0, 4);

  // Newly added products for New Releases section - sort by created_at
  const newReleases = [...products]
    .sort((a, b) => {
      if (a.created_at && b.created_at) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    })
    .slice(0, 4);

  // Handle product click to open dialog
  const handleProductClick = (product: EnhancedTonerType) => {
    setSelectedProduct(product);
    setIsProductDetailsOpen(true);
  };

  if (isLoadingSettings || loadingProducts) {
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
      <Toaster position={isMobile ? "top-center" : "top-right"} />

      <HomeHeader />

      <HeroSection />

      <main className="flex-1">
        <PopularProductsSection 
          products={popularProducts} 
          onViewProductDetails={handleProductClick} 
        />
        <NewReleasesSection 
          products={newReleases}
          onProductClick={handleProductClick} 
        />
        <PrinterSolutionsSection />
        <VideoAds1 />
        <ShopByBrandSection />
        <FAQSection />
        <AdditionalInfoSection />
        <NewsletterSection />
      </main>
      <HomeFooter />

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

// Wrap the store content with StaticSettingsProvider
const Store = () => (
  <StaticSettingsProvider>
    <StoreContent />
  </StaticSettingsProvider>
);

export default Store;
