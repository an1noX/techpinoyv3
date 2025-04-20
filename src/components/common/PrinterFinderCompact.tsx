
import { useState } from "react";
import { Search, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PrinterFinderCompact() {
  const [query, setQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Using static content instead of navigation
      toast.success(`Searching for "${query}" - This is a static demo`);
      
      // Reset form
      setQuery("");
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-4 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <Printer className="h-5 w-5 text-white" />
        <h3 className="text-lg font-semibold text-white">Find Your Printer</h3>
      </div>
      
      <p className="text-sm text-teal-50 mb-4">
        Search for your printer model to find compatible supplies
      </p>
      
      <form onSubmit={handleSearch} className="flex flex-col gap-2">
        <Input
          type="text"
          placeholder="Enter printer model (e.g., HP LaserJet Pro)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white/90 border-0 focus:ring-2 focus:ring-yellow-300"
        />
        
        <Button 
          type="submit" 
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
        >
          <Search className="h-4 w-4 mr-2" />
          Find My Printer
        </Button>
      </form>
    </div>
  );
}
