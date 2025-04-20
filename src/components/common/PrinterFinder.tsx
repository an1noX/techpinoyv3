
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Printer, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPrinters } from "@/data/mockData";

export function PrinterFinder() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Connect with the mock backend data
      const foundPrinters = mockPrinters.filter(printer => 
        printer.model.toLowerCase().includes(query.toLowerCase()) ||
        (printer.make && printer.make.toLowerCase().includes(query.toLowerCase()))
      );
      
      if (foundPrinters.length > 0) {
        // Navigate to the printer page
        navigate(`/printers/${foundPrinters[0].id}`);
      } else {
        // Navigate to the search results page
        navigate(`/printers/search/${encodeURIComponent(query)}`);
      }
    }
  };
  
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-500 to-teal-700 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Printer className="h-6 w-6" />
          Find Your Printer
        </CardTitle>
        <p className="text-teal-50">
          Easily find compatible inks and toners for your printer
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter your printer model (e.g., HP LaserJet Pro)"
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
            Find My Supplies
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm text-teal-50">
          <p>Popular searches: HP LaserJet, Canon PIXMA, Brother MFC</p>
        </div>
      </CardContent>
    </Card>
  );
}
