import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { EnhancedTonerType } from "@/pages/Store";
import { toast } from "sonner";

interface PopularProductsSectionProps {
  products: EnhancedTonerType[];
  onViewProductDetails: (product: EnhancedTonerType) => void;
  onProductClick?: (product: EnhancedTonerType) => void;
}

export function PopularProductsSection({ products, onViewProductDetails, onProductClick }: PopularProductsSectionProps) {
  const handleProductClick = (product: EnhancedTonerType) => {
    if (onProductClick) {
      onProductClick(product);
    }
    onViewProductDetails(product);
  };

  const handleAddToCart = (product: EnhancedTonerType) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find((item: any) => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">Popular Products</h2>
        <p className="text-center text-gray-600 mb-10">
          Top products chosen by our customers
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-4 flex items-center justify-center h-48 bg-white">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                <p className="text-sm text-gray-600 mb-1">{product.manufacturer}</p>
                <p className="text-sm text-gray-600 mb-3 capitalize">
                  {product.type} | {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </p>
                <p className="text-xl font-bold text-primary">{formatPrice(product.price || 0)}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="ghost"
                  className="flex-shrink-0"
                  onClick={() => handleProductClick(product)}
                >
                  Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
