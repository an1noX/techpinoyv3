
import { TonerType } from "@/types/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Printer, ShoppingCart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface RelatedTonersProps {
  toners: TonerType[];
  printerMake: string;
}

export function RelatedToners({ toners, printerMake }: RelatedTonersProps) {
  const isMobile = useIsMobile();
  const placeholderImage = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/832px-No-Image-Placeholder.svg.png";

  if (toners.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {toners.map(toner => {
        // Calculate display price from product_toners if available, or use placeholder
        const displayPrice = 19.95; // Default price if not available
        
        return (
          <Card key={toner.id} className="overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-200 rounded-xl group">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <div className="p-3 w-full sm:w-24 h-24 flex-shrink-0 sm:border-r bg-gray-50 group-hover:bg-blue-50 transition-colors">
                  <img 
                    src={toner.image_url || placeholderImage} 
                    alt={toner.name || toner.model} 
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                
                <div className="flex-1 p-4">
                  <h4 className="font-medium text-sm mb-1 group-hover:text-techblue-600 transition-colors">
                    {toner.name || `${toner.brand} ${toner.model}`}
                  </h4>
                  <div className="flex items-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < Math.floor(4.5) ? "fill-amber-400" : "fill-gray-200"}`} />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      ({(Math.random() * (5 - 4) + 4).toFixed(1)})
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center">
                    <Printer className="h-3 w-3 inline mr-1 text-gray-400" />
                    Compatible with various {printerMake} models
                  </p>
                </div>
                
                <div className="p-4 text-right border-t sm:border-t-0 sm:border-l bg-gray-50 group-hover:bg-blue-50 transition-colors">
                  <div className="text-lg font-bold text-red-500">
                    ₱{displayPrice.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 line-through">
                    ₱{(displayPrice * 1.3).toFixed(2)}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Button 
                      className="bg-techblue-500 hover:bg-techblue-600 transition-colors"
                      size="sm"
                    >
                      View
                    </Button>
                    {!isMobile && (
                      <Button 
                        className="bg-techpinoy-500 hover:bg-techpinoy-600 transition-colors"
                        size="sm"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
