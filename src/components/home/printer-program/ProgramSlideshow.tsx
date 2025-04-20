
import { useState, useEffect } from "react";
import { LucideIcon } from "lucide-react";

export interface SlideContent {
  id: number;
  title: string;
  content: string;
  icon: LucideIcon;
}

interface ProgramSlideshowProps {
  slideshowContent: SlideContent[];
}

export function ProgramSlideshow({ slideshowContent }: ProgramSlideshowProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const totalSlides = slideshowContent.length;
  
  // Auto rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides);
    }, 6500); // Change slide every 6.5 seconds
    
    return () => clearInterval(interval);
  }, [totalSlides]);
  
  return (
    <div className="w-full md:w-1/2 p-4 bg-white/70 rounded-lg backdrop-blur-sm">
      <h3 className="text-lg md:text-xl font-bold text-techpinoy-600 mb-4">
        Learn About Our Printer Program
      </h3>
      
      {/* Slideshow container */}
      <div className="relative min-h-[250px]">
        {slideshowContent.map((slide, index) => (
          <div 
            key={slide.id}
            className={`absolute top-0 left-0 w-full transition-opacity duration-500 ease-in-out 
              ${index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div className="bg-white/60 p-3 rounded-lg h-full flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-techpinoy-100 text-techpinoy-600">
                  <slide.icon size={18} />
                </div>
                <h4 className="font-bold text-gray-800 text-base md:text-lg">{slide.title}</h4>
              </div>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed pl-9 flex-grow line-clamp-4">{slide.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Slide indicators */}
      <div className="flex justify-center space-x-2 mt-4">
        {slideshowContent.map((_, index) => (
          <button 
            key={index}
            onClick={() => setActiveSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 
              ${index === activeSlide ? 'bg-techpinoy-600 w-5' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
}
