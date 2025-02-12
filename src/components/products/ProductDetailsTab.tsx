
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ProductDetailsTabProps {
  formData: any;
  setFormData: (data: any) => void;
  approvalStatusOptions: any[];
  productStatusOptions: any[];
}

export function ProductDetailsTab({ 
  formData, 
  setFormData,
  approvalStatusOptions,
  productStatusOptions 
}: ProductDetailsTabProps) {
  const [uomOptions, setUomOptions] = useState<{ id: string; label: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUOMOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('master_data')
          .select('id, label')
          .eq('category', 'UOM')
          .eq('status', 'ACTIVE')
          .order('sort_order', { ascending: true });

        if (error) throw error;

        setUomOptions(data || []);
      } catch (error) {
        console.error('Error fetching UOM options:', error);
        toast({
          title: "Error",
          description: "Failed to load UOM options",
          variant: "destructive",
        });
      }
    };

    fetchUOMOptions();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="flex items-center">
              Product Name <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="brandName">Brand Name</Label>
            <Input
              id="brandName"
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="code" className="flex items-center">
              Product Code <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="uom" className="flex items-center">
                Unit of Measure <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select 
                value={formData.uomId || ""}
                onValueChange={(value) => setFormData({ ...formData, uomId: value })}
              >
                <SelectTrigger id="uom">
                  <SelectValue placeholder="Select UOM" />
                </SelectTrigger>
                <SelectContent>
                  {uomOptions.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="unitSize" className="flex items-center">
                Unit Size <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="unitSize"
                type="number"
                value={formData.unitSize}
                onChange={(e) => setFormData({ ...formData, unitSize: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Product Characteristics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="productSet"
              checked={formData.productSet}
              onCheckedChange={(checked) => setFormData({ ...formData, productSet: checked })}
            />
            <Label htmlFor="productSet">Product Set</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="aerosol"
              checked={formData.aerosol}
              onCheckedChange={(checked) => setFormData({ ...formData, aerosol: checked })}
            />
            <Label htmlFor="aerosol">Aerosol</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="cryogenicFluid"
              checked={formData.cryogenicFluid}
              onCheckedChange={(checked) => setFormData({ ...formData, cryogenicFluid: checked })}
            />
            <Label htmlFor="cryogenicFluid">Cryogenic Fluid</Label>
          </div>
        </div>

        <div>
          <Label htmlFor="otherNames">Other Names</Label>
          <Textarea
            id="otherNames"
            value={formData.otherNames}
            onChange={(e) => setFormData({ ...formData, otherNames: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="uses">Uses</Label>
          <Textarea
            id="uses"
            value={formData.uses}
            onChange={(e) => setFormData({ ...formData, uses: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="approvalStatus">Approval Status</Label>
            <Select
              value={formData.approvalStatusId?.toString()}
              onValueChange={(value) => setFormData({ ...formData, approvalStatusId: parseInt(value) })}
            >
              <SelectTrigger id="approvalStatus">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {approvalStatusOptions.map(option => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="productStatus">Product Status</Label>
            <Select
              value={formData.productStatusId?.toString()}
              onValueChange={(value) => setFormData({ ...formData, productStatusId: parseInt(value) })}
            >
              <SelectTrigger id="productStatus">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {productStatusOptions.map(option => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
