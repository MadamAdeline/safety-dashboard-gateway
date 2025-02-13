import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { LocationSelection } from "../LocationSelection";
import { ProductSelection } from "../ProductSelection";
import { Input } from "@/components/ui/input";
import type { Location } from "@/types/location";
import type { Product } from "@/types/product";
import { createSiteRegister } from "@/services/site-registers";

interface GridRow {
  id: string;
  locationId: string;
  exactLocation: string;
  productId: string;
  currentStockLevel: number;
  unitSize?: number;
  uomId?: string;
  product: Product | null;
  location: Location | null;
}

interface SiteRegisterGridProps {
  onClose: () => void;
  defaultLocationId?: string;
  onSave?: () => void;
}

export function SiteRegisterGrid({ onClose, defaultLocationId, onSave }: SiteRegisterGridProps) {
  const [rows, setRows] = useState<GridRow[]>([
    {
      id: crypto.randomUUID(),
      locationId: defaultLocationId || '',
      exactLocation: '',
      productId: '',
      currentStockLevel: 0,
      product: null,
      location: null,
    },
  ]);

  const addNewRow = () => {
    setRows(prev => [...prev, {
      id: crypto.randomUUID(),
      locationId: defaultLocationId || '',
      exactLocation: '',
      productId: '',
      currentStockLevel: 0,
      product: null,
      location: null,
    }]);
  };

  const updateRow = (id: string, updates: Partial<GridRow>) => {
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, ...updates } : row
    ));
  };

  const validateRow = (row: GridRow): boolean => {
    return !!(row.locationId && row.productId && row.currentStockLevel >= 0);
  };

  const handleSaveRow = async (row: GridRow) => {
    if (!validateRow(row)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createSiteRegister({
        location_id: row.locationId,
        product_id: row.productId,
        exact_location: row.exactLocation,
        current_stock_level: row.currentStockLevel,
        total_qty: row.currentStockLevel * (row.unitSize || 0),
        uom_id: row.uomId,
        status_id: 1, // Adding status_id with default value 1 (active)
      });

      toast({
        title: "Success",
        description: "Site register entry saved successfully",
      });

      // Call the onSave callback to refresh the list
      onSave?.();

      // Clear the fields but keep the row
      updateRow(row.id, {
        exactLocation: '',
        productId: '',
        currentStockLevel: 0,
        product: null,
        // Keep the location if it was defaulted
        ...(defaultLocationId ? {} : { locationId: '', location: null }),
      });
    } catch (error) {
      console.error('Error saving site register:', error);
      toast({
        title: "Error",
        description: "Failed to save site register entry",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    onSave?.(); // Refresh the list before closing
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[95%] max-w-7xl max-h-[95vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Quick Entry Grid</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr_1fr_0.5fr] gap-4 bg-gray-100 p-2 rounded">
            <div className="font-bold">
              Location <span className="text-red-500">*</span>
            </div>
            <div>Exact Location</div>
            <div className="font-bold">
              Product <span className="text-red-500">*</span>
            </div>
            <div># of Units</div>
            <div>Unit Size</div>
            <div>UOM</div>
            <div>Actions</div>
          </div>

          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr_1fr_0.5fr] gap-4 items-start min-h-[120px] py-4">
              <LocationSelection
                locationId={row.locationId}
                onLocationSelect={(location) => updateRow(row.id, {
                  locationId: location.id,
                  location
                })}
                hideLabel={true}
              />
              
              <Input
                value={row.exactLocation}
                onChange={(e) => updateRow(row.id, { exactLocation: e.target.value })}
                placeholder="Exact Location"
              />

              <ProductSelection
                productId={row.productId}
                selectedProduct={row.product}
                onProductSelect={(product) => updateRow(row.id, {
                  productId: product.id,
                  product,
                  unitSize: product.unitSize,
                  uomId: product.uomId
                })}
                hideLabel={true}
              />

              <Input
                type="number"
                min="0"
                value={row.currentStockLevel}
                onChange={(e) => updateRow(row.id, { 
                  currentStockLevel: parseFloat(e.target.value) || 0 
                })}
              />

              <Input
                value={row.unitSize || ''}
                readOnly
                className="bg-gray-50"
              />

              <Input
                value={row.product?.uom?.label || ''}
                readOnly
                className="bg-gray-50"
              />

              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-green-600"
                  onClick={() => handleSaveRow(row)}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-red-600"
                  onClick={() => setRows(prev => prev.filter(r => r.id !== row.id))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Button onClick={addNewRow}>Add Row</Button>
        </div>
      </div>
    </div>
  );
}
