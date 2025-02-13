import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Location } from "@/types/location";
import type { Product } from "@/types/product";
import { LocationSelection } from "./LocationSelection";
import { ProductSelection } from "./ProductSelection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import React from "react";
import { StockMovementsGrid } from "./StockMovementsGrid";
import { useLocationDetails } from "@/hooks/use-location-details";

interface SiteRegisterDetailsTabProps {
  formData: {
    id?: string;
    location_id: string;
    product_id: string;
    override_product_name: string;
    exact_location: string;
    storage_conditions: string;
    current_stock_level?: number;
    max_stock_level?: number;
    uom_id?: string;
    total_qty?: number;
    status_id: number;
  };
  onChange: (field: string, value: string | number) => void;
  onProductSelect: (product: Product) => void;
  selectedProduct: Product | null;
  isEditing: boolean;
  onStockUpdate?: () => void;
  isRestrictedRole: boolean;
  userLocation?: { id: string; full_path: string } | null;
}

export function SiteRegisterDetailsTab({ 
  formData, 
  onChange,
  onProductSelect,
  selectedProduct,
  isEditing,
  onStockUpdate,
  isRestrictedRole,
  userLocation
}: SiteRegisterDetailsTabProps) {

  // Query to check if the site register has any stock movements
  const { data: hasStockMovements } = useQuery({
    queryKey: ['hasStockMovements', formData.id],
    queryFn: async () => {
      if (!formData.id) return false;

      const { count, error } = await supabase
        .from('stock_movements')
        .select('*', { count: 'exact', head: true })
        .eq('site_register_id', formData.id);

      if (error) {
        console.error('Error checking stock movements:', error);
        return false;
      }

      return (count || 0) > 0;
    },
    enabled: !!formData.id
  });

  // Get location details
  const { data: currentLocation } = useLocationDetails(formData.location_id);

  // If editing and has stock movements, make location and product read-only
  const isReadOnly = isEditing && hasStockMovements;

  // Query for status options
  const { data: statusOptions } = useQuery({
    queryKey: ['site-register-statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('status_lookup')
        .select('*')
        .eq('category', 'SITE_REGISTER')
        .order('id');

      if (error) throw error;
      return data;
    }
  });

  // Format number with thousand separators
  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '';
    return value.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Location Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          {isRestrictedRole ? (
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={currentLocation?.name || ''}
                readOnly
                className="bg-gray-100"
              />
              {userLocation?.full_path && (
                <Input
                  value={userLocation.full_path}
                  readOnly
                  className="mt-2 bg-gray-50 text-gray-600"
                />
              )}
            </div>
          ) : (
            <LocationSelection
              locationId={formData.location_id}
              onLocationSelect={(location: Location) => onChange("location_id", location.id)}
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="exact_location">Exact Location (Free Text)</Label>
          <Input
            id="exact_location"
            value={formData.exact_location}
            onChange={(e) => onChange("exact_location", e.target.value)}
          />
        </div>
      </div>

      {/* Product Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          {isReadOnly ? (
            <div className="space-y-2">
              <Label>Product</Label>
              <Input
                value={selectedProduct?.name || ''}
                readOnly
                className="bg-gray-100"
              />
            </div>
          ) : (
            <ProductSelection
              productId={formData.product_id}
              selectedProduct={selectedProduct}
              onProductSelect={onProductSelect}
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="override_product_name">Override Product Name</Label>
          <Input
            id="override_product_name"
            value={formData.override_product_name}
            onChange={(e) => onChange("override_product_name", e.target.value)}
            placeholder={selectedProduct?.name || ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="storage_conditions">Storage Conditions</Label>
        <Textarea
          id="storage_conditions"
          value={formData.storage_conditions}
          onChange={(e) => onChange("storage_conditions", e.target.value)}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status_id">Status</Label>
          <Select
            value={formData.status_id?.toString()}
            onValueChange={(value) => onChange("status_id", parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions?.map((status) => (
                <SelectItem key={status.id} value={status.id.toString()}>
                  {status.status_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isEditing && (
        <>
          <div className="pt-4">
            <Label className="text-lg font-semibold">Stock Information</Label>
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_stock_level">Current Stock Level (# of Units)</Label>
              <Input
                id="current_stock_level"
                type="text"
                value={formatNumber(formData.current_stock_level)}
                readOnly
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_qty">Total Quantity</Label>
              <Input
                id="total_qty"
                type="text"
                value={formatNumber(formData.total_qty)}
                readOnly
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_stock_level">Max Stock Level</Label>
              <Input
                id="max_stock_level"
                type="number"
                value={formData.max_stock_level || ''}
                onChange={(e) => onChange("max_stock_level", parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_size">Unit Size</Label>
              <Input
                id="unit_size"
                value={selectedProduct?.unitSize || ''}
                readOnly
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uom_id">Unit of Measure</Label>
              <Input
                id="uom_id"
                value={selectedProduct?.uom?.label || ''}
                readOnly
                className="bg-gray-100"
              />
            </div>
          </div>

          {formData.id && (
            <div className="pt-8">
              <StockMovementsGrid 
                siteRegisterId={formData.id}
                onStockUpdate={onStockUpdate}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
