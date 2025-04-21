
import { useState } from "react";
import { Search, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function PrinterFinderCompact() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Search for printers in the Wiki
      const { data: printerData, error: printerError } = await supabase
        .from('wiki_printers')
        .select('*')
        .or(`make.ilike.%${query}%,model.ilike.%${query}%,series.ilike.%${query}%`)
        .limit(3);
      
      if (printerError) throw printerError;
      
      // Search for toners by name or model
      const { data: tonerData, error: tonerError } = await supabase
        .from('product_toners')
        .select(`
          *,
          toner:toner_id (
            id,
            brand,
            model,
            color
          )
        `)
        .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
        .limit(3);
      
      if (tonerError) throw tonerError;
      
      // Determine search result priority
      if (printerData && printerData.length > 0) {
        // Found a printer - navigate to a product page with filtered printers
        navigate(`/products?printer=${encodeURIComponent(printerData[0].id)}`);
        toast.success(`Found printer: ${printerData[0].make} ${printerData[0].model}`);
      } else if (tonerData && tonerData.length > 0) {
        // Found a toner - navigate to a product page with filtered toners
        navigate(`/products?toner=${encodeURIComponent(query)}`);
        toast.success(`Found toner: ${tonerData[0].name}`);
      } else {
        // No exact matches found - navigate to search results page
        navigate(`/products?search=${encodeURIComponent(query)}`);
        toast(`No exact matches found for "${query}"`);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-4 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <Printer className="h-5 w-5 text-white" />
        <h3 className="text-lg font-semibold text-white">Find Your Supplies</h3>
      </div>
      
      <p className="text-sm text-teal-50 mb-4">
        Search by printer model or toner number
      </p>
      
      <form onSubmit={handleSearch} className="flex flex-col gap-2">
        <Input
          type="text"
          placeholder="Printer model or toner number"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white/90 border-0 focus:ring-2 focus:ring-yellow-300"
        />
        
        <Button 
          type="submit" 
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
          disabled={isSearching}
        >
          <Search className="h-4 w-4 mr-2" />
          {isSearching ? "Searching..." : "Find Supplies"}
        </Button>
      </form>
    </div>
  );
}
