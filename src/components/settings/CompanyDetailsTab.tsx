
import React, { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function CompanyDetailsTab() {
  const { settings, saveSettings, isLoading } = useSettings();
  const [form, setForm] = useState(() => ({
    store_name: settings?.store_name || "",
    email: settings?.email || "",
    phone_number: settings?.phone_number || "",
    office_hours: settings?.office_hours || "",
    address: settings?.address || "",
    tagline: settings?.tagline || "",
    social_media: {
      facebook: settings?.social_media.facebook || "",
      instagram: settings?.social_media.instagram || "",
      youtube: settings?.social_media.youtube || "",
      twitter: settings?.social_media.twitter || "",
    },
  }));
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (["facebook", "instagram", "youtube", "twitter"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        social_media: { ...prev.social_media, [name]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    await saveSettings({
      ...settings,
      store_name: form.store_name,
      email: form.email,
      phone_number: form.phone_number,
      office_hours: form.office_hours,
      address: form.address,
      tagline: form.tagline,
      social_media: {
        facebook: form.social_media.facebook,
        instagram: form.social_media.instagram,
        youtube: form.social_media.youtube,
        twitter: form.social_media.twitter,
      },
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 py-4">
      <h2 className="text-xl font-semibold mb-2">Company Details</h2>
      <div>
        <Label htmlFor="store_name">Name</Label>
        <Input id="store_name" name="store_name" value={form.store_name} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" value={form.email} onChange={handleChange} type="email" />
      </div>
      <div>
        <Label htmlFor="phone_number">Phone</Label>
        <Input id="phone_number" name="phone_number" value={form.phone_number} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="office_hours">Office Hours</Label>
        <Input id="office_hours" name="office_hours" value={form.office_hours} onChange={handleChange} />
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
            value={form.social_media.facebook}
            onChange={handleChange}
          />
          <Input
            placeholder="Instagram"
            name="instagram"
            value={form.social_media.instagram}
            onChange={handleChange}
          />
          <Input
            placeholder="YouTube"
            name="youtube"
            value={form.social_media.youtube}
            onChange={handleChange}
          />
          <Input
            placeholder="Twitter"
            name="twitter"
            value={form.social_media.twitter}
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
