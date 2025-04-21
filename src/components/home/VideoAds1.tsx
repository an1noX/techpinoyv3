
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSettings } from "@/context/SettingsContext";
import { useEffect, useState } from "react";

export const VideoAds1 = () => {
  const isMobile = useIsMobile();
  const { settings } = useSettings();
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Get video ad content from settings or use defaults
  const videoAds = settings?.video_ads1 || {
    videoType: "placeholder", // placeholder, youtube, mp4, file
    videoUrl: "",
    title: "TechPinoy - Your Best Toner Cartridge Supplier",
    description: "We provide high-quality toner cartridges for all major printer brands at competitive prices. Our products are rigorously tested to ensure optimal performance and longevity.",
    features: [
      "Premium quality compatible cartridges",
      "Free shipping on orders over ₱2,500",
      "30-day money-back guarantee",
      "Dedicated customer support"
    ],
    buttonText: "Learn More",
    buttonLink: "#"
  };

  useEffect(() => {
    console.log("VideoAds1: Received settings", settings);
    console.log("VideoAds1: video_ads1 value", settings?.video_ads1);
  }, [settings]);

  // Render appropriate video player based on type
  const renderVideoPlayer = () => {
    console.log("Rendering video player with type:", videoAds.videoType, "and URL:", videoAds.videoUrl);
    
    switch (videoAds.videoType) {
      case "youtube":
        if (!videoAds.videoUrl) return renderPlaceholder();
        
        // Extract YouTube ID from URL if it's a full URL
        const getYoutubeId = (url: string) => {
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
          const match = url.match(regExp);
          return (match && match[2].length === 11) ? match[2] : url;
        };
        
        const youtubeId = getYoutubeId(videoAds.videoUrl);
        
        return (
          <div className="relative w-full h-0 pb-[56.25%] rounded-xl overflow-hidden shadow-lg">
            <iframe 
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setVideoLoaded(true)}
            ></iframe>
          </div>
        );
        
      case "mp4":
        if (!videoAds.videoUrl) return renderPlaceholder();
        
        return (
          <div className="rounded-xl overflow-hidden shadow-lg">
            <video 
              className="w-full h-auto"
              controls
              onLoadedData={() => setVideoLoaded(true)}
            >
              <source src={videoAds.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
        
      case "file":
        if (!videoAds.videoUrl) return renderPlaceholder();
        
        return (
          <div className="rounded-xl overflow-hidden shadow-lg">
            <video 
              className="w-full h-auto"
              controls
              onLoadedData={() => setVideoLoaded(true)}
            >
              <source src={videoAds.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
        
      case "placeholder":
      default:
        return renderPlaceholder();
    }
  };

  const renderPlaceholder = () => {
    const placeholderUrl = "https://placehold.co/600x400/e6f7ff/0077cc?text=TechPinoy+Cartridges";
    
    return (
      <div className="rounded-xl overflow-hidden shadow-lg">
        <img 
          src={placeholderUrl}
          alt="TechPinoy - Your Best Toner Cartridge Supplier" 
          className="w-full h-auto"
          onLoad={() => setVideoLoaded(true)}
        />
      </div>
    );
  };

  return (
    <section className="py-12 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2 mb-6 md:mb-0 transform transition-all duration-500 hover:scale-[1.02]">
            {renderVideoPlayer()}
          </div>
          <div className="w-full md:w-1/2 md:pl-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-techblue-700 animate-fade-in">
              {videoAds.title}
            </h2>
            <p className="text-gray-700 mb-6 text-base md:text-lg">
              {videoAds.description}
            </p>
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <ul className="space-y-3">
                {videoAds.features && videoAds.features.map((item, index) => (
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
              onClick={() => window.location.href = videoAds.buttonLink}
            >
              {videoAds.buttonText} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
