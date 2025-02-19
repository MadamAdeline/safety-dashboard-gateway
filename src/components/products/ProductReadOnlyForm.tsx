import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Product } from "@/types/product";
import type { SDS } from "@/types/sds";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { SDSPreview } from "@/components/sds/SDSPreview";
import { ProductHazardsTab } from "./ProductHazardsTab";

interface ProductReadOnlyFormProps {
  onClose: () => void;
  data: Product;
}

export function ProductReadOnlyForm({ onClose, data }: ProductReadOnlyFormProps) {
  console.log("=== START: ProductReadOnlyForm Render ===");
  console.log("Full product data:", data);
  console.log("SDS object:", data.sds);
  if (data.sds) {
    console.log("SDS dates:", {
      expiryDate: data.sds.expiryDate,
      issueDate: data.sds.issueDate,
      revisionDate: data.sds.revisionDate
    });
  }

  // Map the product's SDS data to match the required SDS type
  const mappedSDS: SDS | null = data.sds ? {
    id: data.sds.id,
    productId: data.id,
    productName: data.name,
    isDG: data.sds.isDG,
    supplier: data.sds.supplier?.supplier_name || '',
    supplierId: data.sds.supplier?.id || '',
    issueDate: data.sds.issueDate || '',
    expiryDate: data.sds.expiryDate || '',
    revisionDate: data.sds.revisionDate || '',
    dgClassId: data.sds.dgClass?.id || null,
    dgClass: data.sds.dgClass || null,
    subsidiaryDgClassId: null,
    subsidiaryDgClass: null,
    packingGroupId: data.sds.packingGroup?.id || null,
    packingGroup: data.sds.packingGroup || null,
    dgSubDivisionId: data.sds.dgSubDivision?.id || null,
    dgSubDivision: data.sds.dgSubDivision || null,
    status: 'ACTIVE',
    sdsSource: null,
    source: null,
    currentFilePath: data.sds.currentFilePath || null,
    currentFileName: data.sds.currentFileName || null,
    currentFileSize: data.sds.currentFileSize || null,
    currentContentType: data.sds.currentContentType || null,
    unNumber: null,
    unProperShippingName: null,
    hazchemCode: null,
    otherNames: null,
    emergencyPhone: null,
    requestSupplierName: null,
    requestSupplierDetails: null,
    requestInformation: null,
    requestDate: null,
    requestedBy: null
  } : null;

  const formatDate = (dateString?: string) => {
    console.log("Formatting date string:", dateString);
    if (!dateString) {
      console.log("Date string is empty or undefined");
      return "-";
    }
    try {
      const date = new Date(dateString);
      console.log("Parsed date object:", date);
      const formattedDate = format(date, "dd/MM/yyyy");
      console.log("Formatted date result:", formattedDate);
      return formattedDate;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  return (
    <div className="max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-dgxprt-navy">View Product</h2>
          <p className="text-gray-500">View product details</p>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="sds">SDS Information</TabsTrigger>
            <TabsTrigger value="hazards">Hazards & Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <div className="p-2 bg-gray-50 rounded border">{data.name}</div>
              </div>
              <div className="space-y-2">
                <Label>Product Code *</Label>
                <div className="p-2 bg-gray-50 rounded border">{data.code}</div>
              </div>
              <div className="space-y-2">
                <Label>Brand Name</Label>
                <div className="p-2 bg-gray-50 rounded border">{data.brandName || "-"}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 col-span-1">
                <div className="space-y-2">
                  <Label>Unit of Measure *</Label>
                  <div className="p-2 bg-gray-50 rounded border">{data.uom?.label || "-"}</div>
                </div>
                <div className="space-y-2">
                  <Label>Unit Size</Label>
                  <div className="p-2 bg-gray-50 rounded border">{data.unitSize || "-"}</div>
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <div className="p-2 bg-gray-50 rounded border">{data.description || "-"}</div>
              </div>
              <div className="space-y-4 col-span-2">
                <h3 className="text-lg font-semibold">Product Characteristics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Product Set</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {data.productSet ? "Yes" : "No"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Aerosol</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {data.aerosol ? "Yes" : "No"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cryogenic Fluid</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {data.cryogenicFluid ? "Yes" : "No"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Other Names</Label>
                <div className="p-2 bg-gray-50 rounded border">{data.otherNames || "-"}</div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Uses</Label>
                <div className="p-2 bg-gray-50 rounded border">{data.uses || "-"}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 col-span-2">
                <div className="space-y-2">
                  <Label>Approval Status *</Label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {data.approvalStatusId ? "Approved" : "Pending"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Product Status *</Label>
                  <div className="p-2 bg-gray-50 rounded border">{data.status}</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sds">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Associated SDS</Label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {data.name || ""}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SDS Product Code</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {data.code || "-"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>SDS Expiry Date</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {formatDate(data.sds?.expiryDate)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Issue Date</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {formatDate(data.sds?.issueDate)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Revision Date</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {formatDate(data.sds?.revisionDate)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Supplier Name</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {data.sds?.supplier?.supplier_name || "-"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Is Dangerous Goods</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {data.sds?.isDG ? "Yes" : "No"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>DG Class</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {data.sds?.dgClass?.label || "-"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>DG Sub Division</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      {data.sds?.dgSubDivision?.label || "Not Applicable"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Packing Group</Label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {data.sds?.packingGroup?.label || "-"}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <SDSPreview 
                  onUploadClick={() => {}}
                  initialData={mappedSDS}
                  selectedFile={null}
                  readOnly={true}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hazards">
            <ProductHazardsTab
              productId={data.id}
              readOnly
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
