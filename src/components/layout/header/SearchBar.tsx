
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full md:max-w-xl">
      <div className="relative flex w-full">
        <Input
          type="text"
          placeholder="Search by Printer Model, Cartridge # or Keywords..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-r-none border-r-0 focus:ring-teal-500 focus:border-teal-500"
        />
        <Button
          type="submit"
          className="bg-teal-500 hover:bg-teal-600 rounded-l-none"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
