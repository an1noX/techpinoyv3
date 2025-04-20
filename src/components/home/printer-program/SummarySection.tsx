
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Wrench, Truck, DollarSign, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BenefitItem } from "./BenefitItem";

export function SummarySection() {
  const navigate = useNavigate();
  
  const handleInterestClick = useCallback(() => {
    toast.success("Thank you for your interest! A representative will contact you soon.");
  }, []);

  const benefits = [
    {
      icon: Printer,
      text: "Printer provided for free usage",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Wrench,
      text: "Free repairs, maintenance & on-call support",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: DollarSign,
      text: "Only pay for toner (competitive pricing)",
      color: "bg-amber-100 text-amber-600"
    },
    {
      icon: Check,
      text: "Reliable performance guaranteed",
      color: "bg-purple-100 text-purple-600"
    }
  ];

  return (
    <div className="w-full md:w-1/2 bg-white/90 p-4 rounded-lg backdrop-blur-sm">
      {/* Headline */}
      <h3 className="text-lg md:text-xl font-bold text-techpinoy-600 mb-3">
        🔥 Free-to-Use Printer Program – Limited Time Offer!
      </h3>
      
      {/* Benefits list */}
      <ul className="space-y-2 mb-4">
        {benefits.map((benefit, index) => (
          <BenefitItem 
            key={index}
            icon={benefit.icon}
            text={benefit.text}
            delay={index * 150}
            color={benefit.color}
          />
        ))}
      </ul>
      
      {/* CTA Button */}
      <div className="mb-3">
        <Button 
          onClick={handleInterestClick} 
          className="bg-orange-500 hover:bg-orange-600 text-white w-full animate-pulse-gentle"
        >
          I'm Interested
        </Button>
      </div>
      
      {/* Terms and conditions footer */}
      <p className="text-[10px] text-gray-500 italic text-center">
        Terms and conditions apply. Printer remains property of TechPinoy.
      </p>
    </div>
  );
}
