
import { Label } from "@/components/ui/label";
import { ProductSearch } from "@/components/products/ProductSearch";
import type { Product } from "@/types/product";

interface ProductSelectionProps {
  productId: string;
  selectedProduct: Product | null;
  onProductSelect: (product: Product) => void;
}

export function ProductSelection({ productId, selectedProduct, onProductSelect }: ProductSelectionProps) {
  return (
    <div className="space-y-2">
      <Label>Product</Label>
      <ProductSearch
        selectedProductId={productId}
        value={selectedProduct?.name}
        onProductSelect={onProductSelect}
        className="w-full"
      />
    </div>
  );
}
