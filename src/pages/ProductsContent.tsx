
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductDetailsDialog } from '@/components/products/ProductDetailsDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Product } from '@/types/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ProductsContent = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get search parameters
  const printerParam = searchParams.get('printer');
  const tonerParam = searchParams.get('toner');
  const searchParam = searchParams.get('search');

  useEffect(() => {
    fetchProducts();
  }, [printerParam, tonerParam, searchParam]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('product_toners')
        .select(`
          *,
          toner:wiki_toners (
            id,
            brand,
            model,
            color,
            page_yield,
            compatible_printers
          )
        `);

      // Filter by printer ID from Wiki
      if (printerParam) {
        // First find the printer's compatible toners
        const { data: compatData, error: compatError } = await supabase
          .from('printer_toner_compatibility')
          .select('toner_id')
          .eq('printer_wiki_id', printerParam);

        if (compatError) throw compatError;
        
        if (compatData && compatData.length > 0) {
          // Get toners that are compatible with this printer
          const tonerIds = compatData.map(item => item.toner_id);
          query = query.filter('toner_id', 'in', `(${tonerIds.join(',')})`);
        } else {
          // If no direct compatibility info, try to get printer info and match by brand/model
          const { data: printerData, error: printerError } = await supabase
            .from('wiki_printers')
            .select('*')
            .eq('id', printerParam)
            .single();
            
          if (printerError) throw printerError;
          
          if (printerData) {
            // Try to match toners that might be compatible based on printer make
            query = query.filter('toner.brand', 'eq', printerData.make);
          }
        }
      }
      // Filter by toner search string
      else if (tonerParam) {
        query = query.or(`name.ilike.%${tonerParam}%,sku.ilike.%${tonerParam}%`);
      }
      // General search term
      else if (searchParam) {
        query = query.or(`name.ilike.%${searchParam}%,sku.ilike.%${searchParam}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Map for display
      const mappedProducts = (data || []).map(item => mapDbToProduct(item));
      setProducts(mappedProducts);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      toast.error(err?.message ?? "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Map DB product to Product type
  const mapDbToProduct = (item: any): Product => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    price: Number(item.price),
    category: Array.isArray(item.category) && item.category.length > 0 ? item.category[0] : "Toner",
    brand: item.toner?.brand || '',
    quantityInStock: item.stock_level || 0,
    imageUrl: item.image_url || "https://placehold.co/200x200/e6f7ff/333?text=Toner"
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="container px-4 py-8">
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No products found</p>
          <Button onClick={() => navigate('/products')} className="mt-4">
            View All Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => handleProductClick(product)}
            />
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductDetailsDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

export default ProductsContent;
