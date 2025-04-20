
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface PrinterHeaderProps {
  title: string;
  description?: string;
  showViewAllButton?: boolean;
  onViewAll?: () => void;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonVariant?: "default" | "outline" | "ghost" | "link";
}

export function PrinterHeader({
  title,
  description,
  showViewAllButton = true,
  onViewAll,
  buttonText = "View All Printers",
  buttonIcon = <ArrowRight className="h-4 w-4" />,
  buttonVariant = "default"
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
            variant={buttonVariant}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            {buttonText} {buttonIcon}
          </Button>
        </div>
      )}
    </div>
  );
}
