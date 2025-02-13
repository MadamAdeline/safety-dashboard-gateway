
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { LocationSelection } from "../LocationSelection";
import { ProductSelection } from "../ProductSelection";
import { Input } from "@/components/ui/input";
import type { Location } from "@/types/location";
import type { Product } from "@/types/product";
import { createSiteRegister } from "@/services/site-registers";
import { useUserRole } from "@/hooks/use-user-role";

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
  const { data: userData } = useUserRole();
  const isRestrictedUser = userData?.role?.toLowerCase() === 'manager' || userData?.role?.toLowerCase() === 'standard';

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
    // If user is restricted, don't allow location updates
    if (isRestrictedUser && 'locationId' in updates) {
      return;
    }
    
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, ...updates } : row
    ));
  };

  const validateRow = (row: GridRow): boolean => {
    return !!(row.locationId && row.productId && row.currentStockLevel >= 0);
  };

  const handleSaveAll = async () => {
    const validRows = rows.filter(validateRow);
    
    if (validRows.length === 0) {
      toast({
        title: "No Valid Entries",
        description: "Please fill in all required fields for at least one row",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save all valid rows in parallel
      await Promise.all(
        validRows.map(row =>
          createSiteRegister({
            location_id: row.locationId,
            product_id: row.productId,
            exact_location: row.exactLocation,
            current_stock_level: row.currentStockLevel,
            total_qty: row.currentStockLevel * (row.unitSize || 0),
            uom_id: row.uomId,
            status_id: 1,
          })
        )
      );

      toast({
        title: "Success",
        description: `Successfully saved ${validRows.length} entries`,
      });

      // Refresh the parent list
      onSave?.();

      // Reset the grid with a single empty row
      setRows([{
        id: crypto.randomUUID(),
        locationId: defaultLocationId || '',
        exactLocation: '',
        productId: '',
        currentStockLevel: 0,
        product: null,
        location: null,
      }]);
    } catch (error) {
      console.error('Error saving site registers:', error);
      toast({
        title: "Error",
        description: "Failed to save entries",
        variant: "destructive",
      });
    }
  };

  const removeRow = (id: string) => {
    setRows(prev => {
      const filtered = prev.filter(r => r.id !== id);
      // Always keep at least one row
      if (filtered.length === 0) {
        return [{
          id: crypto.randomUUID(),
          locationId: defaultLocationId || '',
          exactLocation: '',
          productId: '',
          currentStockLevel: 0,
          product: null,
          location: null,
        }];
      }
      return filtered;
    });
  };

  const handleClose = () => {
    onSave?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="fixed inset-4 bg-white rounded-lg flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold">Quick Entry Grid</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr_1fr_0.5fr] gap-4 bg-gray-100 p-4 rounded sticky top-0 z-10">
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
              <div key={row.id} className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr_1fr_0.5fr] gap-4 items-start min-h-[150px] p-4 border rounded-lg">
                {isRestrictedUser ? (
                  <Input 
                    value={row.location?.name || ''}
                    readOnly
                    className="bg-gray-50"
                  />
                ) : (
                  <LocationSelection
                    locationId={row.locationId}
                    onLocationSelect={(location) => updateRow(row.id, {
                      locationId: location.id,
                      location
                    })}
                    hideLabel={true}
                  />
                )}
                
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
                    className="h-8 w-8 text-red-600"
                    onClick={() => removeRow(row.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t flex justify-between">
          <Button onClick={addNewRow}>Add Row</Button>
          <Button 
            onClick={handleSaveAll}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save All
          </Button>
        </div>
      </div>
    </div>
  );
}
