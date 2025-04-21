import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Printer, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPrinters } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function PrinterFinder() {
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
        .limit(5);
      
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
            color,
            page_yield
          )
        `)
        .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
        .limit(5);
      
      if (tonerError) throw tonerError;
      
      // Determine search result priority
      if (printerData && printerData.length > 0) {
        // Found a printer - navigate to a product page with filtered printers
        const firstPrinter = printerData[0];
        navigate(`/products?printer=${encodeURIComponent(firstPrinter.id)}`);
      } else if (tonerData && tonerData.length > 0) {
        // Found a toner - navigate to a product page with filtered toners
        navigate(`/products?toner=${encodeURIComponent(query)}`);
      } else {
        // No exact matches found - navigate to search results page
        navigate(`/products?search=${encodeURIComponent(query)}`);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-500 to-teal-700 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Printer className="h-6 w-6" />
          Find Your Printer or Toner
        </CardTitle>
        <p className="text-teal-50">
          Search by printer model, toner name, or cartridge number to find compatible supplies
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter printer model or toner number (e.g., HP LaserJet or 26A)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-white/90 text-gray-800 border-0 h-12 pl-10 pr-4 rounded-md w-full focus:ring-2 focus:ring-yellow-300"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg"
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Find My Supplies"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm text-teal-50">
          <p>Popular searches: HP LaserJet, Canon PIXMA, Brother TN-760, HP 26A</p>
        </div>
      </CardContent>
    </Card>
  );
}
