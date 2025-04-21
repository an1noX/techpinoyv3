
import React, { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader, Plus, Save, Trash } from "lucide-react";

// Define the validation schema for the form
const videoAds1Schema = z.object({
  videoType: z.enum(["placeholder", "youtube", "mp4", "file"], {
    required_error: "Please select a video source type",
  }),
  videoUrl: z.string().optional(),
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  features: z.array(z.string()).min(1, {
    message: "Add at least one feature.",
  }),
  buttonText: z.string().min(1, {
    message: "Button text is required.",
  }),
  buttonLink: z.string().min(1, {
    message: "Button link is required.",
  }),
});

export function VideoAds1Tab() {
  const { settings, isLoading, updateStoreInfo, saveSettings } = useSettings();
  const [newFeature, setNewFeature] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values from settings
  const defaultVideo = {
    videoType: "placeholder",
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

  const form = useForm<z.infer<typeof videoAds1Schema>>({
    resolver: zodResolver(videoAds1Schema),
    defaultValues: settings?.video_ads1 || defaultVideo,
  });
  
  const { control, handleSubmit, watch, setValue, formState } = form;
  const watchVideoType = watch("videoType");
  const watchFeatures = watch("features");

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof videoAds1Schema>) => {
    setIsSubmitting(true);
    try {
      if (!settings) {
        toast.error("Settings not found");
        return;
      }

      // Create updated settings with video_ads1 data
      const updatedSettings = {
        ...settings,
        video_ads1: data
      };

      await saveSettings(updatedSettings);
      toast.success("Video ad settings saved successfully");
    } catch (error) {
      console.error("Error saving video settings:", error);
      toast.error("Failed to save video settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a new feature to the features array
  const addFeature = () => {
    if (newFeature.trim() === "") return;
    
    const currentFeatures = watchFeatures || [];
    setValue("features", [...currentFeatures, newFeature]);
    setNewFeature("");
  };

  // Remove a feature from the features array
  const removeFeature = (index: number) => {
    const currentFeatures = [...watchFeatures];
    currentFeatures.splice(index, 1);
    setValue("features", currentFeatures);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Loader className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Video Ads Section</h3>
        <p className="text-sm text-gray-500">Configure the video ad section that appears on the home page.</p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={control}
                name="videoType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Source Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select video source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="placeholder">Placeholder Image</SelectItem>
                        <SelectItem value="youtube">YouTube Link</SelectItem>
                        <SelectItem value="mp4">MP4 URL</SelectItem>
                        <SelectItem value="file">Uploaded File</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the type of video source you want to display.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchVideoType !== "placeholder" && (
                <FormField
                  control={control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>
                        {watchVideoType === "youtube" ? "YouTube Video ID or URL" : 
                         watchVideoType === "mp4" ? "MP4 Video URL" : 
                         "File Upload URL"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder={
                            watchVideoType === "youtube" ? "Enter YouTube ID or full URL" : 
                            watchVideoType === "mp4" ? "Enter MP4 URL" : 
                            "Enter file URL"
                          } 
                        />
                      </FormControl>
                      <FormDescription>
                        {watchVideoType === "youtube" ? 
                          "Enter the YouTube video ID or full URL (e.g., dQw4w9WgXcQ or https://www.youtube.com/watch?v=dQw4w9WgXcQ)" : 
                          watchVideoType === "mp4" ? 
                          "Enter the direct URL to an MP4 video file" : 
                          "Enter the URL of your uploaded video file"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <FormField
                control={control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter section title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Section Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Enter section description" 
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-6">
                <FormLabel>Features</FormLabel>
                <div className="mt-2 space-y-2">
                  {watchFeatures?.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input 
                        value={feature} 
                        onChange={(e) => {
                          const updatedFeatures = [...watchFeatures];
                          updatedFeatures[index] = e.target.value;
                          setValue("features", updatedFeatures);
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => removeFeature(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a new feature"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addFeature}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                {form.formState.errors.features && (
                  <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.features.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <FormField
                control={control}
                name="buttonText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button Text</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter button text" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="buttonLink"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Button Link</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter button link URL" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="w-full md:w-auto" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </form>
      </Form>
    </div>
  );
}
