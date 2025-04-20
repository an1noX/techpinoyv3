
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface PrinterHeaderProps {
  title: string;
  description?: string;
  showViewAllButton?: boolean;
  onViewAll?: () => void;
}

export function PrinterHeader({
  title,
  description,
  showViewAllButton = true,
  onViewAll
}: PrinterHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-3">{title}</h2>
      {description && (
        <p className="text-gray-600 max-w-2xl mx-auto">
          {description}
        </p>
      )}
      
      {showViewAllButton && (
        <div className="flex justify-center mt-4">
          <Button 
            onClick={onViewAll} 
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            View All Printers <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
