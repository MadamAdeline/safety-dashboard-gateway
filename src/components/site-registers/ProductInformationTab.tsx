
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SDSPreview } from "@/components/sds/SDSPreview";
import type { Product } from "@/types/product";
import type { SDS } from "@/types/sds";

interface ProductInformationTabProps {
  product: Product | null;
}

export function ProductInformationTab({ product }: ProductInformationTabProps) {
  console.log("ProductInformationTab - Received product prop (complete):", product);
  
  if (!product) {
    console.log("ProductInformationTab - No product selected");
    return (
      <div className="p-4 text-center text-gray-500">
        Please select a product to view its details
      </div>
    );
  }

  // Convert the product's SDS data to match the SDS type
  const sdsData: SDS | null = product.sds ? {
    id: product.sds.id,
    productName: product.name,
    productId: product.id,
    isDG: product.sds.isDG,
    supplier: product.sds.supplier?.supplier_name || '',
    supplierId: product.sds.supplier?.id || '',
    status: 'ACTIVE',
    sdsSource: null,
    source: null,
    // Get the current_file_path from the SDS record
    currentFilePath: product.sds.currentFilePath || null,
    currentFileName: product.sds.currentFileName || `${product.name}_SDS.pdf`,
    currentFileSize: product.sds.currentFileSize || null,
    currentContentType: product.sds.currentContentType || 'application/pdf',
    issueDate: '',
    expiryDate: '',
    dgClassId: product.sds.dgClass?.id || '',
    dgClass: product.sds.dgClass || null,
    subsidiaryDgClassId: null,
    subsidiaryDgClass: null,
    packingGroupId: product.sds.packingGroup?.id || '',
    packingGroup: product.sds.packingGroup || null,
    dgSubDivisionId: null,
    dgSubDivision: null,
    unNumber: null,
    unProperShippingName: null,
    hazchemCode: null,
    otherNames: null,
    emergencyPhone: null,
    revisionDate: null,
    requestSupplierName: null,
    requestSupplierDetails: null,
    requestInformation: null,
    requestDate: null,
    requestedBy: null
  } : null;

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Product Name</Label>
          <Input value={product.name || ''} readOnly className="bg-gray-50" />
        </div>

        <div className="space-y-2">
          <Label>Brand Name</Label>
          <Input value={product.brandName || ''} readOnly className="bg-gray-50" />
        </div>

        <div className="space-y-2">
          <Label>Product Code</Label>
          <Input value={product.code || ''} readOnly className="bg-gray-50" />
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
            <Checkbox checked={product.aerosol || false} disabled />
            <Label>Is Aerosol</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox checked={product.cryogenicFluid || false} disabled />
            <Label>Is Cryogenic Fluid</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox checked={product.productSet || false} disabled />
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

      <div className="space-y-4">
        <Label>SDS Document</Label>
        <SDSPreview
          initialData={sdsData}
          selectedFile={null}
          onUploadClick={() => {}}
          readOnly={true}
        />
      </div>
    </div>
  );
}
