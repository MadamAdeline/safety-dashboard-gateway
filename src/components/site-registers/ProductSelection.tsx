
import { Label } from "@/components/ui/label";
import { ProductSearch } from "@/components/products/ProductSearch";
import type { Product } from "@/types/product";

interface ProductSelectionProps {
  productId: string;
  selectedProduct: Product | null;
  onProductSelect: (product: Product) => void;
  hideLabel?: boolean;
}

export function ProductSelection({ productId, selectedProduct, onProductSelect, hideLabel }: ProductSelectionProps) {
  return (
    <div className="space-y-2">
      {!hideLabel && <Label>Product</Label>}
      <ProductSearch
        selectedProductId={productId}
        value={selectedProduct?.name}
        onProductSelect={onProductSelect}
        className="w-full"
      />
    </div>
  );
}
