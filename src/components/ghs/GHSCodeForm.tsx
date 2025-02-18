
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GHSCodeFormProps {
  onClose: () => void;
  initialData?: {
    ghs_code_id: string;
    ghs_code: string;
    pictogram_url: string | null;
  } | null;
}

export function GHSCodeForm({ onClose, initialData }: GHSCodeFormProps) {
  const [formData, setFormData] = useState({
    ghs_code: initialData?.ghs_code || "",
    pictogram_image: null as File | null,
    pictogram_url: initialData?.pictogram_url || "",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.pictogram_url || null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      let pictogram_url = data.pictogram_url;
      
      if (data.pictogram_image) {
        const fileExt = data.pictogram_image.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('ghs_pictograms')
          .upload(filePath, data.pictogram_image);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('ghs_pictograms')
          .getPublicUrl(filePath);

        pictogram_url = urlData.publicUrl;
      }

      if (initialData?.ghs_code_id) {
        const { data: updated, error } = await supabase
          .from('ghs_codes')
          .update({
            ghs_code: data.ghs_code,
            pictogram_url
          })
          .eq('ghs_code_id', initialData.ghs_code_id)
          .select()
          .single();

        if (error) throw error;
        return updated;
      } else {
        const { data: created, error } = await supabase
          .from('ghs_codes')
          .insert([{
            ghs_code: data.ghs_code,
            pictogram_url
          }])
          .select()
          .single();

        if (error) throw error;
        return created;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ghs-codes'] });
      toast({
        title: "Success",
        description: `GHS Code ${initialData ? 'updated' : 'created'} successfully`
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error saving GHS Code:', error);
      toast({
        title: "Error",
        description: `Failed to ${initialData ? 'update' : 'create'} GHS Code`,
        variant: "destructive"
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        pictogram_image: file
      }));
      
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleSave = async () => {
    if (!formData.ghs_code) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      await createMutation.mutateAsync(formData);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{initialData ? 'Edit' : 'New'} GHS Code</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending || isUploading}
            className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
          >
            {createMutation.isPending || isUploading ? "Saving..." : "Save"}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="ghs_code" className="after:content-['*'] after:ml-0.5 after:text-red-500">
            GHS Code
          </Label>
          <Input
            id="ghs_code"
            value={formData.ghs_code}
            onChange={(e) => setFormData(prev => ({ ...prev, ghs_code: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pictogram">
            Pictogram Image
          </Label>
          <Input
            id="pictogram"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {previewUrl && (
            <div className="mt-4">
              <img 
                src={previewUrl} 
                alt="Pictogram preview" 
                className="max-w-[200px] h-auto border rounded-md"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
