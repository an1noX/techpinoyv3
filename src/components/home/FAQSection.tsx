
import { useIsMobile } from "@/hooks/use-mobile";
import { CheckCircle, DollarSign, Heart } from "lucide-react";

export const FAQSection = () => {
  const isMobile = useIsMobile();
  
  // Static FAQ items
  const faqItems = [
    {
      id: "1",
      question: "Quality You Can Trust",
      answer: "All of our toner cartridges undergo rigorous quality testing to ensure optimal performance. We stand behind our products with a 100% satisfaction guarantee.",
      icon: "check"
    },
    {
      id: "2",
      question: "Unbeatable Value",
      answer: "Save up to 70% compared to original manufacturer cartridges without sacrificing quality. Our high-capacity toners deliver more prints per cartridge.",
      icon: "dollar"
    },
    {
      id: "3",
      question: "Our Commitment to You",
      answer: "Fast shipping, dedicated customer support, and easy returns. We're not happy unless you're completely satisfied with your purchase.",
      icon: "heart"
    }
  ];
  
  // Helper function to get icon based on item icon name
  const getIcon = (iconName?: string) => {
    if (!iconName) return <CheckCircle className="h-6 w-6 text-techblue-700" />;
    
    switch (iconName.toLowerCase()) {
      case 'dollar':
      case 'money':
        return <DollarSign className="h-6 w-6 text-techpinoy-700" />;
      case 'heart':
      case 'love':
        return <Heart className="h-6 w-6 text-teal-700" />;
      case 'check':
      default:
        return <CheckCircle className="h-6 w-6 text-techblue-700" />;
    }
  };
  
  return (
    <section className="py-12 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-techblue-700">
          What Makes TechPinoy A Top Toner Cartridge Supplier?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {faqItems.map((item, index) => (
            <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className={`${index === 0 ? "bg-techblue-100" : index === 1 ? "bg-techpinoy-100" : "bg-teal-100"} p-3 rounded-lg`}>
                  {getIcon(item.icon)}
                </div>
                <h3 className={`text-lg font-semibold ml-3 ${index === 0 ? "text-techblue-700" : index === 1 ? "text-techpinoy-700" : "text-teal-700"}`}>
                  {item.question}
                </h3>
              </div>
              <p className="text-gray-700">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
