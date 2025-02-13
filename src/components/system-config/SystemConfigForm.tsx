
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSystemSettings, updateSystemSettings, uploadLogo } from "@/services/system-settings";
import type { SystemSettings } from "@/types/system-settings";
import { Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function SystemConfigForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: getSystemSettings,
    onSuccess: (data) => {
      // Set CSS variables when settings are loaded
      if (data) {
        document.documentElement.style.setProperty('--primary-color', data.primary_color);
        document.documentElement.style.setProperty('--secondary-color', data.secondary_color);
        document.documentElement.style.setProperty('--accent-color', data.accent_color);
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateSystemSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
      toast({
        title: "Success",
        description: "System settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update system settings",
        variant: "destructive",
      });
    },
  });

  const [formData, setFormData] = useState<Partial<SystemSettings>>({
    customer_name: '',
    customer_email: '',
    auto_update_sds: false,
    primary_color: '#9747FF',
    secondary_color: '#14162D',
    accent_color: '#F1F0FB',
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
      if (settings.logo_path) {
        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(settings.logo_path);
        setPreviewUrl(publicUrl);
      }
    }
  }, [settings]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let logoPath = formData.logo_path;

      if (logoFile) {
        const { filePath } = await uploadLogo(logoFile);
        logoPath = filePath;
      }

      await updateMutation.mutateAsync({
        ...formData,
        id: settings?.id,
        logo_path: logoPath,
      });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4"
        onClick={() => navigate(-1)}
      >
        <X className="h-4 w-4" />
      </Button>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="customer_name">Customer Name</Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="customer_email">Customer Contact Email</Label>
            <Input
              id="customer_email"
              type="email"
              value={formData.customer_email}
              onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="logo">Logo</Label>
            <div className="mt-2 space-y-4">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Logo preview"
                  className="h-16 object-contain"
                />
              )}
              <Input
                id="logo"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleLogoChange}
                className="mt-2"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Theme Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-24 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="w-24 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="accent_color">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accent_color"
                    type="color"
                    value={formData.accent_color}
                    onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                    className="w-24 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={formData.accent_color}
                    onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto_update_sds"
              checked={formData.auto_update_sds}
              onCheckedChange={(checked) => setFormData({ ...formData, auto_update_sds: checked })}
            />
            <Label htmlFor="auto_update_sds">Update SDS Automatically</Label>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={updateMutation.isPending}
          className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
        >
          {updateMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </Card>
  );
}
