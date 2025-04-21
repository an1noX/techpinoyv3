
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";

// Interface for a brand/make
interface Brand {
  id: string;
  name: string;
  logo_url?: string;
}

// Fetch unique makes from Wiki table
async function fetchBrandsFromWiki(): Promise<Brand[]> {
  // Select distinct makes
  const { data, error } = await supabase
    .from("printer_wiki")
    .select("make")
    .order("make", { ascending: true });

  if (error) throw error;

  // Extract unique makes
  const allMakes: string[] = (data ?? []).map((row: any) => row.make).filter(Boolean);
  const uniqueMakes = Array.from(new Set(allMakes));

  // For logo, use a placeholder based on make name for now (future: asset bucket)
  return uniqueMakes.map((make, idx) => ({
    id: String(idx + 1),
    name: make,
    logo_url: `https://placehold.co/200x100/e6f7ff/333?text=${encodeURIComponent(make)}`,
  }));
}

export const ShopByBrandSection = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Fetch brands/makes from Supabase Wiki
  const { data: featuredBrands = [], isLoading, isError } = useQuery({
    queryKey: ["printer_wiki", "brands"],
    queryFn: fetchBrandsFromWiki,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000,
  });

  // If fallback needed (Wiki fails to load), use some static brands from original
  const fallbackBrands: Brand[] = [
    { id: "1", name: "HP", logo_url: "https://placehold.co/200x100/e6f7ff/333?text=HP" },
    { id: "2", name: "Canon", logo_url: "https://placehold.co/200x100/e6f7ff/333?text=Canon" },
    { id: "3", name: "Brother", logo_url: "https://placehold.co/200x100/e6f7ff/333?text=Brother" },
    { id: "4", name: "Epson", logo_url: "https://placehold.co/200x100/e6f7ff/333?text=Epson" }
  ];

  const brandsToShow = !isError && featuredBrands.length > 0 ? featuredBrands : fallbackBrands;

  const handleBrandClick = (brandName: string) => {
    // Show toast
    toast.info(`Viewing ${brandName} products`, {
      description: "Now showing toners for this brand",
      duration: 3000,
    });
    navigate(`/brands/${encodeURIComponent(brandName)}`);
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold mb-8 text-center text-gray-800">
          Shop Printer Ink, Toner & Drum Cartridges by Printer Brand
        </h2>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[120px]">
            <Loader className="animate-spin mr-2" />
            <span>Loading brands...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {brandsToShow.slice(0, 4).map(brand => (
                <div
                  key={brand.id}
                  className="bg-white border border-gray-200 hover:border-techblue-300 hover:shadow-md transition-all duration-300 flex flex-col items-center p-6 rounded-xl group cursor-pointer"
                  onClick={() => handleBrandClick(brand.name)}
                  tabIndex={0}
                  role="button"
                  onKeyPress={e => { if (e.key === "Enter") handleBrandClick(brand.name); }}
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
                </div>
              ))}
            </div>

            {/* Additional brands, if any */}
            {!isMobile && brandsToShow.length > 4 && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-6 gap-4">
                {brandsToShow.slice(4).map(brand => (
                  <div
                    key={brand.id}
                    className="bg-white border border-gray-100 hover:border-gray-300 transition-all duration-300 flex flex-col items-center p-3 rounded-lg cursor-pointer"
                    onClick={() => handleBrandClick(brand.name)}
                    tabIndex={0}
                    role="button"
                    onKeyPress={e => { if (e.key === "Enter") handleBrandClick(brand.name); }}
                  >
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="h-6 w-auto object-contain mb-2"
                    />
                    <span className="text-xs text-gray-600 hover:text-techblue-600 transition-colors">View Products</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
