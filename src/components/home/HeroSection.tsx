
import React from "react";
import { PrinterFinderCompact } from "@/components/common/PrinterFinderCompact";
import { useIsMobile } from "@/hooks/use-mobile";
import { FreePrinterProgram } from "./FreePrinterProgram";

export function HeroSection() {
  const isMobile = useIsMobile();
  
  return (
    <div className="w-full mt-4 mb-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side - Free Printer Program */}
          <div className="w-full md:w-2/3">
            <FreePrinterProgram />
          </div>
          
          {/* Right side - Printer finder */}
          <div className="w-full md:w-1/3 bg-gradient-to-b from-techpinoy-700 to-techpinoy-600 rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 flex flex-col h-[270px]">
              <div className="text-center mb-3">
                <h3 className="text-lg md:text-xl text-white font-bold">Find Ink & Toner</h3>
                <p className="text-white text-xs md:text-sm">select your printer below</p>
              </div>
              
              <div className="flex-grow">
                <PrinterFinderCompact />
              </div>
            </div>
          </div>
        </div>
        
        {/* Shop heading below the hero section */}
        <div className="text-center mt-6 mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-techblue-600 mb-2">
            Shop Printer Ink, Toner & Drum Cartridges for Less
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-xs md:text-sm text-gray-700">
              Buy high-quality printer ink cartridges, toner cartridges & drum units at discounted prices. Find a wide range of printer cartridges for Brother, Canon, HP, Xerox, etc. Enjoy free shipping on all orders over $30 to the contiguous U.S. Shop with confidence knowing our 30-day money back guarantee and 2-year product warranty!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
