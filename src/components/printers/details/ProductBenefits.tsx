
import { Card, CardContent } from "@/components/ui/card";

interface ProductBenefitsProps {
  printerModel: string;
}

export function ProductBenefits({ printerModel }: ProductBenefitsProps) {
  return (
    <div>
      <h3 className="text-xl font-bold text-[#004165] mb-4">Why Choose Our Compatible Toners?</h3>
      
      <div className="prose max-w-none text-gray-700">
        <p className="mb-4">
          Our premium compatible cartridges for your {printerModel} offer exceptional value without sacrificing quality. Each cartridge is precisely engineered to fit and function perfectly with your printer, delivering crisp text, vibrant graphics, and reliable performance page after page.
        </p>
        <p className="mb-4">
          All our compatible toners undergo rigorous quality testing to ensure they meet or exceed OEM specifications, providing you with a reliable, high-quality printing experience at a fraction of the cost of original cartridges.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-[#004165] mb-2">Superior Quality</h4>
              <p className="text-sm">Premium components and rigorous testing ensure print quality comparable to OEM cartridges</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-[#004165] mb-2">Cost Savings</h4>
              <p className="text-sm">Save up to 70% compared to original manufacturer cartridges without compromising quality</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-[#004165] mb-2">Satisfaction Guaranteed</h4>
              <p className="text-sm">All products backed by our 30-day money-back guarantee and expert technical support</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
