
import { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { StoreInfo } from "@/types/settings";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

const storeInfoSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  tagline: z.string(),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  officeHours: z.string(),
  address: z.string(),
  liveChat: z.object({
    enabled: z.boolean(),
    type: z.enum(["messenger", "whatsapp", "custom"]),
    value: z.string()
  }).required(),
  socialMedia: z.object({
    facebook: z.string().url().optional().or(z.literal("")),
    instagram: z.string().url().optional().or(z.literal("")),
    youtube: z.string().url().optional().or(z.literal("")),
    twitter: z.string().url().optional().or(z.literal(""))
  }).required()
}).required();

type StoreInfoForm = z.infer<typeof storeInfoSchema>;

export default function StoreSettings() {
  const navigate = useNavigate();
  const { settings, updateStoreInfo, isLoading } = useSettings();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<StoreInfoForm>({
    resolver: zodResolver(storeInfoSchema),
    defaultValues: {
      storeName: "",
      tagline: "",
      phoneNumber: "",
      email: "",
      officeHours: "",
      address: "",
      liveChat: {
        enabled: false,
        type: "messenger",
        value: ""
      },
      socialMedia: {
        facebook: "",
        instagram: "",
        youtube: "",
        twitter: ""
      }
    }
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings.storeInfo) {
      form.reset(settings.storeInfo);
    }
  }, [settings.storeInfo, form]);

  const onSubmit = async (data: StoreInfoForm) => {
    try {
      setIsSaving(true);
      await updateStoreInfo(data as StoreInfo);
      toast({
        title: "Settings saved",
        description: "Store settings have been updated successfully."
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="container mx-auto py-8 flex items-center justify-center h-[80vh]">
          <LoadingSpinner size={32} className="text-primary" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="container mx-auto py-8 px-4 md:px-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/store")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Store Information</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-20">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline/Motto</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your store's tagline or motto" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(XXX) XXX-XXXX" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="support@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="officeHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Office Hours</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Mon–Fri 9:00AM – 6:00PM" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Your store's physical address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Chat Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="liveChat.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-4">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Enable Live Chat</FormLabel>
                    </FormItem>
                  )}
                />

                {form.watch("liveChat.enabled") && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="liveChat.type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chat Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select chat type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="messenger">Facebook Messenger</SelectItem>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="liveChat.value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chat ID/Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={
                                form.watch("liveChat.type") === "messenger"
                                  ? "Messenger Page ID"
                                  : form.watch("liveChat.type") === "whatsapp"
                                  ? "WhatsApp Number"
                                  : "Custom Chat URL"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="socialMedia.facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Facebook URL" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialMedia.instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Instagram URL" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialMedia.youtube"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="YouTube URL" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialMedia.twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Twitter URL" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Link to="/store">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size={16} className="mr-2" />
                    Saving...
                  </>
                ) : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </MobileLayout>
  );
}
