
import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

interface PrinterSolutionProps {
  brand: string;
  type: string;
  model: string;
  description: string;
  purchasePrice: string;
  rentalPrice: string;
  compatibleToners: string[];
  imageUrl?: string;
}

const PrinterSolution = ({
  brand,
  type,
  model,
  description,
  purchasePrice,
  rentalPrice,
  compatibleToners,
  imageUrl
}: PrinterSolutionProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 transition-all hover:shadow-md">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <div className="absolute top-2 left-2 flex space-x-1">
          <span className="text-xs font-semibold uppercase bg-gray-800 text-white px-2 py-1 rounded">
            {brand}
          </span>
          <span className="text-xs font-semibold uppercase bg-blue-600 text-white px-2 py-1 rounded">
            {type}
          </span>
        </div>
        <img 
          src={imageUrl} 
          alt={model} 
          className="w-full h-full object-contain"
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{model}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <p className="text-xs text-gray-500">Purchase Price:</p>
            <p className="font-bold text-gray-900">{purchasePrice}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Rental:</p>
            <p className="font-bold text-blue-600">{rentalPrice}/month</p>
          </div>
        </div>
        
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Compatible Toner:</p>
          <div className="flex flex-wrap gap-1">
            {compatibleToners.map((toner, index) => (
              <span key={index} className="text-xs bg-gray-100 border border-gray-200 rounded px-2 py-1">
                {toner}
              </span>
            ))}
          </div>
        </div>
        
        <p className="text-xs text-blue-600 mb-3">Save up to 40% with our compatible toner cartridges</p>
        
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-9 text-xs">
            View Details
          </Button>
          <Button className="h-9 text-xs bg-green-500 hover:bg-green-600">
            Inquire Rental
          </Button>
        </div>
      </div>
    </div>
  );
};

export function PrinterSolutionsSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Printers");
  const navigate = useNavigate();
  
  const filters = ["All Printers", "Laser", "Inkjet", "Multifunction"];
  
  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/printers/search/${encodeURIComponent(searchQuery)}`);
    }
  };
  
  // Updated printer data with real images
  const printers = [
    {
      brand: "HP",
      type: "Laser",
      model: "HP LaserJet Pro M402dn",
      description: "Fast and efficient monochrome laser printer ideal for small to medium businesses. Print up to 40 pages per minute with automatic duplex printing.",
      purchasePrice: "₱14999.00",
      rentalPrice: "₱999.00",
      compatibleToners: ["26A", "26X"],
      imageUrl: "https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c05584913.png"
    },
    {
      brand: "Brother",
      type: "Laser",
      model: "Brother DCP-L2540DW",
      description: "All-in-one monochrome laser printer with print, copy, and scan capabilities. Features built-in connectivity and mobile device printing.",
      purchasePrice: "₱12999.00",
      rentalPrice: "₱899.00",
      compatibleToners: ["TN-2380", "TN-2360"],
      imageUrl: "https://www.brother.com.ph/-/media/ap/products/dcp/dcp-l2540dw/dcp-l2540dw_main.png"
    },
    {
      brand: "Canon",
      type: "Laser",
      model: "Canon imageCLASS MF445dw",
      description: "Advanced multifunction laser printer with print, copy, scan, and fax capabilities. Features a 5-inch color touchscreen and automatic duplex printing.",
      purchasePrice: "₱19999.00",
      rentalPrice: "₱1299.00",
      compatibleToners: ["057", "057H"],
      imageUrl: "https://ph.canon/media/image/2019/07/17/0250d47e7dfa40aab5c717e05479ff39_MF445dw_default-2-246x185.jpg"
    }
  ];
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Printer Solutions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find the perfect printer for your business or home office. Available for purchase or rent with maintenance included.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
            {filters.map((filter) => (
              <button
                key={filter}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  activeFilter === filter 
                    ? "bg-teal-600 text-white" 
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => handleFilterClick(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-auto">
            <Input
              type="text"
              placeholder="Search printers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 w-full md:w-64"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {printers.map((printer, index) => (
            <PrinterSolution
              key={index}
              brand={printer.brand}
              type={printer.type}
              model={printer.model}
              description={printer.description}
              purchasePrice={printer.purchasePrice}
              rentalPrice={printer.rentalPrice}
              compatibleToners={printer.compatibleToners}
              imageUrl={printer.imageUrl}
            />
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            View All Printers <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
