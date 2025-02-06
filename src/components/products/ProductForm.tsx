import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Product } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { SDSSearch } from "@/components/sds/SDSSearch";

interface ProductFormProps {
  onClose: () => void;
  initialData?: Product | null;
}

export function ProductForm({ onClose, initialData }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name ?? "",
    code: initialData?.code ?? "",
    brandName: "",
    unit: "Litre (L)",
    unitSize: 0,
    description: "",
    productSet: false,
    aerosol: false,
    cryogenicFluid: false,
    otherNames: "",
    uses: "",
    approvalStatusId: null as number | null,
    productStatusId: null as number | null,
    sdsId: initialData?.sdsId ?? null
  });

  const [statusMap, setStatusMap] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  // Fetch status IDs on component mount
  useState(() => {
    const fetchStatusIds = async () => {
      const { data: approvalData, error: approvalError } = await supabase
        .from('status_lookup')
        .select('id, status_name')
        .eq('category', 'PRODUCT_APPROVAL');

      const { data: productStatusData, error: productStatusError } = await supabase
        .from('status_lookup')
        .select('id, status_name')
        .eq('category', 'PRODUCT_STATUS');

      if (approvalError || productStatusError) {
        console.error('Error fetching status IDs:', { approvalError, productStatusError });
        return;
      }

      const statusMapping = {
        ...approvalData?.reduce((acc, curr) => ({
          ...acc,
          [`APPROVAL_${curr.status_name.toUpperCase()}`]: curr.id
        }), {}),
        ...productStatusData?.reduce((acc, curr) => ({
          ...acc,
          [`PRODUCT_${curr.status_name.toUpperCase()}`]: curr.id
        }), {})
      };

      setStatusMap(statusMapping);
    };

    fetchStatusIds();
  }, []);

  const handleSave = async () => {
    try {
      const productData = {
        product_name: formData.name,
        product_code: formData.code,
        brand_name: formData.brandName,
        unit: formData.unit,
        unit_size: formData.unitSize,
        description: formData.description,
        product_set: formData.productSet,
        aerosol: formData.aerosol,
        cryogenic_fluid: formData.cryogenicFluid,
        other_names: formData.otherNames,
        uses: formData.uses,
        approval_status_id: formData.approvalStatusId,
        product_status_id: formData.productStatusId,
        sds_id: formData.sdsId
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', initialData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Product ${initialData ? 'updated' : 'created'} successfully`,
      });
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {initialData ? "Edit Product" : "New Product"}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              className="bg-dgxprt-purple hover:bg-dgxprt-purple/90" 
              onClick={handleSave}
            >
              Save
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Product Details</TabsTrigger>
              <TabsTrigger value="sds">SDS Information</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="brandName">Brand Name</Label>
                    <Input
                      id="brandName"
                      value={formData.brandName}
                      onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="code">Product Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="unit">Unit *</Label>
                      <Select 
                        value={formData.unit}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                      >
                        <SelectTrigger id="unit">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Litre (L)">Litre (L)</SelectItem>
                          <SelectItem value="Kilogram (kg)">Kilogram (kg)</SelectItem>
                          <SelectItem value="Gram (g)">Gram (g)</SelectItem>
                          <SelectItem value="Millilitre (mL)">Millilitre (mL)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="unitSize">Unit Size</Label>
                      <Input
                        id="unitSize"
                        type="number"
                        value={formData.unitSize}
                        onChange={(e) => setFormData(prev => ({ ...prev, unitSize: parseFloat(e.target.value) }))}
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
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, productSet: checked }))}
                    />
                    <Label htmlFor="productSet">Product Set</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="aerosol"
                      checked={formData.aerosol}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, aerosol: checked }))}
                    />
                    <Label htmlFor="aerosol">Aerosol</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cryogenicFluid"
                      checked={formData.cryogenicFluid}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, cryogenicFluid: checked }))}
                    />
                    <Label htmlFor="cryogenicFluid">Cryogenic Fluid</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="otherNames">Other Names</Label>
                  <Textarea
                    id="otherNames"
                    value={formData.otherNames}
                    onChange={(e) => setFormData(prev => ({ ...prev, otherNames: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="uses">Uses</Label>
                  <Textarea
                    id="uses"
                    value={formData.uses}
                    onChange={(e) => setFormData(prev => ({ ...prev, uses: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="approvalStatus">Approval Status *</Label>
                    <Select
                      value={formData.approvalStatusId?.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, approvalStatusId: parseInt(value) }))}
                    >
                      <SelectTrigger id="approvalStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Approved</SelectItem>
                        <SelectItem value="2">Pending</SelectItem>
                        <SelectItem value="3">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="productStatus">Product Status *</Label>
                    <Select
                      value={formData.productStatusId?.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, productStatusId: parseInt(value) }))}
                    >
                      <SelectTrigger id="productStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Active</SelectItem>
                        <SelectItem value="2">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sds">
              <div className="space-y-4">
                <Label>Associated SDS</Label>
                <SDSSearch
                  onSelect={(sds) => setFormData(prev => ({ ...prev, sdsId: sds.id }))}
                  selectedSdsId={formData.sdsId}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}