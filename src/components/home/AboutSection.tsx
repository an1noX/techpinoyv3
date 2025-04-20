
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export const AboutSection = () => {
  const isMobile = useIsMobile();
  
  // Static features
  const features = [
    "Premium quality compatible cartridges",
    "Free shipping on orders over ₱2,500",
    "30-day money-back guarantee",
    "Dedicated customer support"
  ];
  
  // Static image
  const imageUrl = "https://placehold.co/600x400/e6f7ff/0077cc?text=TechPinoy+Cartridges";
  
  return (
    <section className="py-12 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2 mb-6 md:mb-0 transform transition-all duration-500 hover:scale-[1.02]">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img 
                src={imageUrl}
                alt="TechPinoy - Your Best Toner Cartridge Supplier" 
                className="w-full h-auto"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 md:pl-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-techblue-700 animate-fade-in">
              TechPinoy - Your Best Toner Cartridge Supplier
            </h2>
            <p className="text-gray-700 mb-6 text-base md:text-lg">
              We provide high-quality toner cartridges for all major printer brands at competitive prices. Our products are rigorously tested to ensure optimal performance and longevity.
            </p>
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <ul className="space-y-3">
                {features.map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <div className="mr-3 bg-techblue-100 text-techblue-700 p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Button 
              className="bg-techblue-700 hover:bg-techblue-800 transition-all duration-300 transform hover:translate-x-1"
              onClick={() => window.location.href = "#"}
            >
              Learn More <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
