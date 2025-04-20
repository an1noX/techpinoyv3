
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/types";

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-square relative">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="object-cover w-full h-full"
        />
      </div>
      <CardContent className="p-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{product.brand}</p>
          <h3 className="font-medium leading-tight">{product.name}</h3>
          <p className="font-bold">${product.price.toFixed(2)}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={() => onClick && onClick(product)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
