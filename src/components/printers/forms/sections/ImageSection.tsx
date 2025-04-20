
import { useState } from "react";
import FormSection from "../components/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, Upload } from "lucide-react";
import { toast } from "sonner";

interface ImageSectionProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
}

export function ImageSection({ imageUrl, setImageUrl }: ImageSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // For now, just create a local URL preview
    // In a real app, you'd upload to a storage service
    const localUrl = URL.createObjectURL(file);
    setImageUrl(localUrl);
    
    // Simulate upload process
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      toast.success("Image uploaded successfully!");
    }, 1500);
  };
  
  return (
    <FormSection 
      title="Product Image" 
      description="Upload an image of the printer"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Input 
            id="image-url" 
            placeholder="Image URL" 
            value={imageUrl} 
            onChange={(e) => setImageUrl(e.target.value)}
          />
          
          <div className="relative">
            <Input
              type="file"
              id="image-upload"
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              accept="image/*"
              onChange={handleImageChange}
            />
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              disabled={isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-40 bg-gray-100 rounded-md">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Printer" 
              className="h-full object-contain" 
            />
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <ImagePlus size={40} />
              <span className="mt-2 text-sm">No image</span>
            </div>
          )}
        </div>
      </div>
    </FormSection>
  );
}
