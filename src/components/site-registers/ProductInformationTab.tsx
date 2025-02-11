
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { Product } from "@/types/product";

interface ProductInformationTabProps {
  product: Product | null;
}

export function ProductInformationTab({ product }: ProductInformationTabProps) {
  console.log("Product Information:", product);

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
        <Input value={product.name || ''} readOnly className="bg-gray-50" />
      </div>

      <div className="space-y-2">
        <Label>Product Code</Label>
        <Input value={product.code || ''} readOnly className="bg-gray-50" />
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
              <Checkbox checked={product.sds.isDG || false} disabled />
              <Label>Is Dangerous Good</Label>
            </div>

            {product.sds.isDG && product.sds.dgClass && (
              <div className="space-y-2">
                <Label>DG Class</Label>
                <Input value={product.sds.dgClass.label || ''} readOnly className="bg-gray-50" />
              </div>
            )}

            {product.sds.packingGroup && (
              <div className="space-y-2">
                <Label>Packing Group</Label>
                <Input value={product.sds.packingGroup.label || ''} readOnly className="bg-gray-50" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
