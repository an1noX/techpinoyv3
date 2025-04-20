
import { Info, Settings, BarChart, Printer } from "lucide-react";

// Define the content type for the storytelling sections
export interface StoryContent {
  id: number;
  title: string;
  content: string;
  icon: React.ElementType;
}

interface StorySectionProps {
  storyContent: StoryContent[];
}

export function StorySection({ storyContent }: StorySectionProps) {
  return (
    <div className="w-full md:w-1/2 p-4 bg-white/70 rounded-lg backdrop-blur-sm">
      <h3 className="text-lg md:text-xl font-bold text-techpinoy-600 mb-4">
        Learn About Our Printer Program
      </h3>
      
      {/* Animated story sections */}
      <div className="space-y-4 relative min-h-[180px]">
        {storyContent.map((section, index) => (
          <div 
            key={section.id}
            className="transition-all duration-700 bg-white/60 p-3 rounded-lg animate-slide-in"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-techpinoy-100 text-techpinoy-600">
                <section.icon size={18} />
              </div>
              <h4 className="font-bold text-gray-800">{section.title}</h4>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed pl-9">{section.content}</p>
          </div>
        ))}
      </div>
      
      {/* Animated printer icon */}
      <div className="absolute top-8 right-8 animate-float">
        <div className="bg-blue-50 p-2 rounded-full">
          <Printer className="h-8 w-8 text-techpinoy-500" />
        </div>
      </div>
      
      {/* Learn more link */}
      <div className="text-center mt-4">
        <a 
          href="#" 
          className="text-xs text-techblue-600 hover:underline"
        >
          Learn more about our program
        </a>
      </div>
    </div>
  );
}
