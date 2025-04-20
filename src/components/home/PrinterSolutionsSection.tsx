
import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useRentablePrinters } from "@/hooks/useRentablePrinters";

function TonerInfo({ toners }: { toners?: string[] }) {
  if (!toners || toners.length === 0) return null;
  return (
    <div className="mb-3">
      <p className="text-xs text-gray-500 mb-1">Compatible Toner:</p>
      <div className="flex flex-wrap gap-1">
        {toners.map((toner, idx) => (
          <span key={idx} className="text-xs bg-gray-100 border border-gray-200 rounded px-2 py-1">
            {toner}
          </span>
        ))}
      </div>
    </div>
  );
}

function PrinterCard({ printer }: { printer: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 transition-all hover:shadow-md flex flex-col">
      <div className="relative h-44 overflow-hidden bg-gray-100 flex items-center justify-center">
        {printer.make && (
          <span className="absolute top-2 left-2 text-xs font-semibold uppercase bg-gray-800 text-white px-2 py-1 rounded">
            {printer.make}
          </span>
        )}
        {printer.type && (
          <span className="absolute top-2 right-2 text-xs font-semibold uppercase bg-blue-600 text-white px-2 py-1 rounded">
            {printer.type}
          </span>
        )}
        <img
          src={printer.image_url || "/placeholder.svg"}
          alt={printer.model}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-lg">{printer.model}</h3>
          <span className="text-xs ml-2 px-2 py-1 rounded bg-gray-100 text-gray-600 font-normal">
            System Unit
          </span>
        </div>
        <div className="text-xs text-gray-700 mb-2">{printer.series}</div>
        {printer.location && (
          <div className="text-xs text-muted-foreground mb-2">
            <span>Location: <span className="font-medium text-gray-900">{printer.location}</span></span>
          </div>
        )}
        <TonerInfo toners={printer.toners ?? []} />
        <div className="grid grid-cols-2 gap-2 mt-auto">
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
}

export function PrinterSolutionsSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Printers");
  const navigate = useNavigate();
  const { printers, loading } = useRentablePrinters();

  const filters = ["All Printers"];
  const filteredPrinters = printers.filter(printer => {
    const q = searchQuery.toLowerCase();
    return (
      printer.model.toLowerCase().includes(q) ||
      (printer.make || "").toLowerCase().includes(q) ||
      (printer.series || "").toLowerCase().includes(q)
    );
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

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
            {filters.map(filter => (
              <button
                key={filter}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  activeFilter === filter
                    ? "bg-teal-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveFilter(filter)}
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
              onChange={e => setSearchQuery(e.target.value)}
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
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredPrinters.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg text-muted-foreground mb-2">
              No printers available for rent at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {filteredPrinters.map(printer => (
              <PrinterCard key={printer.id} printer={printer} />
            ))}
          </div>
        )}
        <div className="flex justify-center mt-8">
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            View All Printers <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
