
import { ProductForm } from "@/components/products/ProductForm";
import type { Supplier } from "@/types/supplier";
import type { SDS } from "@/types/sds";

interface ProductSetupStepProps {
  supplier: Supplier | null;
  sds: SDS | null;
  onComplete: () => void;
}

export function ProductSetupStep({ supplier, sds, onComplete }: ProductSetupStepProps) {
  if (!supplier || !sds) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Step 3: Create Product</h3>
        <p className="text-gray-600">
          Fill in the product details to complete the setup.
        </p>
      </div>

      <ProductForm
        onClose={onComplete}
        onSave={onComplete}
        initialData={{
          id: "",
          name: "",
          code: "",
          status: "ACTIVE",
          productStatusId: 16,
          sdsId: sds.id,
          sds: {
            id: sds.id,
            isDG: sds.isDG,
            status: sds.status,
            currentFilePath: sds.currentFilePath,
            currentFileName: sds.currentFileName,
            currentFileSize: sds.currentFileSize,
            currentContentType: sds.currentContentType,
            expiryDate: sds.expiryDate,
            issueDate: sds.issueDate,
            revisionDate: sds.revisionDate,
            dgClass: sds.dgClass,
            subsidiaryDgClass: sds.subsidiaryDgClass,
            supplier: {
              id: supplier.id,
              supplier_name: supplier.name
            },
            packingGroup: sds.packingGroup,
            dgSubDivision: sds.dgSubDivision
          }
        }}
      />
    </div>
  );
}
