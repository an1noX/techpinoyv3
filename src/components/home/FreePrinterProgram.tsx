
import { Info, Settings, DollarSign, Printer, Clock } from "lucide-react";
import { SummarySection } from "./printer-program/SummarySection";
import { ProgramSlideshow } from "./printer-program/ProgramSlideshow";

export function FreePrinterProgram() {
  // Updated content for the slideshow with new messaging
  const slideshowContent = [
    {
      id: 1,
      title: "Free-to-Use Printer – No Upfront Costs",
      content: "Get access to a high-quality printer without paying to own it. Just use it as you need — we provide the hardware!",
      icon: Printer
    },
    {
      id: 2,
      title: "We Handle the Hassle",
      content: "Repairs, maintenance, and support are all included. You print, we take care of the rest.",
      icon: Settings
    },
    {
      id: 3,
      title: "Only Pay for Toner – That's It",
      content: "There are no rental fees or hidden charges. You only pay for toner, and our pricing is super competitive.",
      icon: DollarSign
    },
    {
      id: 4,
      title: "Reliable, Ready, and Always On",
      content: "Count on consistent performance and uptime. Perfect for busy teams that can't afford breakdowns.",
      icon: Info
    },
    {
      id: 5,
      title: "Limited-Time Program – Act Now",
      content: "This offer won't last forever. Secure your free-to-use printer today and print worry-free!",
      icon: Clock
    }
  ];
  
  return (
    <div className="w-full py-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl overflow-hidden shadow-md relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-5">
          {/* Left column - Slideshow */}
          <ProgramSlideshow slideshowContent={slideshowContent} />
          
          {/* Right column - Summary & CTA */}
          <SummarySection />
        </div>
      </div>
    </div>
  );
}
