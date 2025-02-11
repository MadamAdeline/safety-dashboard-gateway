
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { Product } from "@/types/product";

interface ProductInformationTabProps {
  product: Product | null;
}

export function ProductInformationTab({ product }: ProductInformationTabProps) {
  if (!product) {
    return (
      <div className="p-4 text-center text-gray-500">
        Please select a product to view its details
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Product Name</Label>
        <Input value={product.name} readOnly className="bg-gray-50" />
      </div>

      <div className="space-y-2">
        <Label>Product Code</Label>
        <Input value={product.code} readOnly className="bg-gray-50" />
      </div>

      <div className="space-y-2">
        <Label>Brand Name</Label>
        <Input value={product.brandName || ''} readOnly className="bg-gray-50" />
      </div>

      <div className="space-y-2">
        <Label>Other Names</Label>
        <Textarea value={product.otherNames || ''} readOnly className="bg-gray-50" />
      </div>

      <div className="space-y-2">
        <Label>Unit of Measure</Label>
        <Input value={product.uom?.label || ''} readOnly className="bg-gray-50" />
      </div>

      <div className="space-y-2">
        <Label>Unit Size</Label>
        <Input value={product.unitSize?.toString() || ''} readOnly className="bg-gray-50" />
      </div>

      <div className="space-y-2">
        <Label>Uses</Label>
        <Textarea value={product.uses || ''} readOnly className="bg-gray-50" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox checked={product.aerosol} disabled />
          <Label>Is Aerosol</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox checked={product.cryogenicFluid} disabled />
          <Label>Is Cryogenic Fluid</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox checked={product.productSet} disabled />
          <Label>Is Product Set</Label>
        </div>
      </div>

      {product.sds && (
        <div className="space-y-4">
          <h3 className="font-semibold">SDS Information</h3>
          
          <div className="space-y-2">
            <Label>Supplier</Label>
            <Input value={product.sds.supplier?.supplier_name || ''} readOnly className="bg-gray-50" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox checked={product.sds.isDG} disabled />
              <Label>Is Dangerous Good</Label>
            </div>

            {product.sds.isDG && product.sds.dgClass && (
              <div className="space-y-2">
                <Label>DG Class</Label>
                <Input value={product.sds.dgClass.label} readOnly className="bg-gray-50" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
