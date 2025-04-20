
import React, { useState } from 'react';
import { TonerType } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react';

interface TonerSlideshowProps {
  toners: TonerType[];
}

export function TonerSlideshow({ toners }: TonerSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (toners.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md">
        <Printer className="h-10 w-10 mx-auto text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">No toners available for this printer</p>
      </div>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? toners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === toners.length - 1 ? 0 : prev + 1));
  };

  const currentToner = toners[currentIndex];

  return (
    <div>
      <Card className="relative overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {currentToner.color || 'Standard'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} of {toners.length}
            </span>
          </div>
          
          <div className="flex items-center justify-center py-6">
            <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center">
              {currentToner.imageUrl ? (
                <img 
                  src={currentToner.imageUrl} 
                  alt={currentToner.model || 'Toner'}
                  className="max-h-20 max-w-20 object-contain"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <span className="text-xs">No image</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center">
            <p className="font-semibold">{currentToner.model}</p>
            <p className="text-sm text-muted-foreground mt-1">{currentToner.brand}</p>
            {currentToner.page_yield && (
              <p className="text-xs mt-1">Page Yield: {currentToner.page_yield} pages</p>
            )}
          </div>
          
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePrevious}
              disabled={toners.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNext}
              disabled={toners.length <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
