
import React, { useEffect, useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Fab } from '@/components/ui/fab';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TonerProductDialog } from '@/components/TonerProductDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CommercialTonerProduct } from '@/types';

export default function TonerProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState<CommercialTonerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CommercialTonerProduct | undefined>();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_toners')
        .select(`
          *,
          toner:toner_id (
            id,
            brand,
            model,
            color,
            page_yield,
            created_at,
            updated_at
          )
        `)
        .order('name');

      if (error) throw error;
      
      const typedData = data?.map(item => {
        return {
          ...item,
          category: Array.isArray(item.category) ? item.category : [],
          toner: item.toner || undefined
        } as CommercialTonerProduct;
      }) || [];
      
      setProducts(typedData);
    } catch (error: any) {
      toast({
        title: "Error fetching products",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(undefined);
    setDialogOpen(true);
  };

  const handleEditProduct = (product: CommercialTonerProduct) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDeleteProduct = async (product: CommercialTonerProduct) => {
    try {
      const { error } = await supabase
        .from('product_toners')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: "Product deleted",
        description: "The product has been successfully removed."
      });

      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSaveProduct = () => {
    fetchProducts();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.toner?.model?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <MobileLayout
      fab={
        <Fab 
          icon={<Plus size={24} />} 
          aria-label="Add toner product" 
          onClick={handleAddProduct}
        />
      }
    >
      <div className="container px-4 py-4 pb-20">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Toner Products</h1>
          <div className="text-sm bg-blue-100 text-blue-800 rounded-md px-2 py-1">
            Inventory
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Manage your commercial toner products and inventory levels.
        </p>

        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setSearchTerm('')}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No products found</p>
            <Button className="mt-4" onClick={handleAddProduct}>
              Add New Product
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">₱{product.price.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {product.stock_level}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    OEM: {(product.toner as any)?.brand} {(product.toner as any)?.model}
                  </p>
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProduct(product)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <TonerProductDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          product={selectedProduct}
          onSave={handleSaveProduct}
        />
      </div>
    </MobileLayout>
  );
}
