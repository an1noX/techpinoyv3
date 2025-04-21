
import React, { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function CompanyDetailsTab() {
  const { settings, updateStoreInfo, isLoading } = useSettings();
  const { toast } = useToast();
  const [form, setForm] = useState(() => ({
    storeName: settings?.store_name || "",
    email: settings?.email || "",
    phoneNumber: settings?.phone_number || "",
    officeHours: settings?.office_hours || "",
    address: settings?.address || "",
    tagline: settings?.tagline || "",
    socialMedia: {
      facebook: settings?.social_media?.facebook || "",
      instagram: settings?.social_media?.instagram || "",
      youtube: settings?.social_media?.youtube || "",
      twitter: settings?.social_media?.twitter || "",
    },
    liveChat: settings?.live_chat || {
      enabled: false,
      type: "messenger",
      value: ""
    }
  }));
  const [saving, setSaving] = useState(false);

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      setForm({
        storeName: settings.store_name || "",
        email: settings.email || "",
        phoneNumber: settings.phone_number || "",
        officeHours: settings.office_hours || "",
        address: settings.address || "",
        tagline: settings.tagline || "",
        socialMedia: {
          facebook: settings.social_media?.facebook || "",
          instagram: settings.social_media?.instagram || "",
          youtube: settings.social_media?.youtube || "",
          twitter: settings.social_media?.twitter || "",
        },
        liveChat: settings.live_chat || {
          enabled: false,
          type: "messenger",
          value: ""
        }
      });
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (["facebook", "instagram", "youtube", "twitter"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        socialMedia: { ...prev.socialMedia, [name]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateStoreInfo) return;
    setSaving(true);
    
    try {
      await updateStoreInfo(form);
      toast({
        title: "Success",
        description: "Company details saved successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save company details",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 py-4">
      <h2 className="text-xl font-semibold mb-2">Company Details</h2>
      <div>
        <Label htmlFor="storeName">Name</Label>
        <Input id="storeName" name="storeName" value={form.storeName} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="tagline">Tagline</Label>
        <Input id="tagline" name="tagline" value={form.tagline} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" value={form.email} onChange={handleChange} type="email" />
      </div>
      <div>
        <Label htmlFor="phoneNumber">Phone</Label>
        <Input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="officeHours">Office Hours</Label>
        <Input id="officeHours" name="officeHours" value={form.officeHours} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" value={form.address} onChange={handleChange} />
      </div>
      <div>
        <Label>Social Media</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Facebook"
            name="facebook"
            value={form.socialMedia.facebook}
            onChange={handleChange}
          />
          <Input
            placeholder="Instagram"
            name="instagram"
            value={form.socialMedia.instagram}
            onChange={handleChange}
          />
          <Input
            placeholder="YouTube"
            name="youtube"
            value={form.socialMedia.youtube}
            onChange={handleChange}
          />
          <Input
            placeholder="Twitter"
            name="twitter"
            value={form.socialMedia.twitter}
            onChange={handleChange}
          />
        </div>
      </div>
      <Button type="submit" className="w-full mt-4" disabled={saving || isLoading}>
        {saving ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
