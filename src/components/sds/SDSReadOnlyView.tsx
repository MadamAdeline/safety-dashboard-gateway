
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SDS } from "@/types/sds";
import { SDSDetailsTab } from "./SDSDetailsTab";
import { SDSVersionTab } from "./SDSVersionTab";
import { SDSPreview } from "./SDSPreview";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SDSReadOnlyViewProps {
  initialData: SDS;
  onClose: () => void;
}

export function SDSReadOnlyView({ initialData, onClose }: SDSReadOnlyViewProps) {
  const handleOpenSDS = () => {
    if (initialData?.currentFilePath) {
      window.open(initialData.currentFilePath, '_blank');
    }
  };

  return (
    <div className="max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">View Safety Data Sheet</h1>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <Tabs defaultValue="product-details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="product-details">SDS Details</TabsTrigger>
              <TabsTrigger value="version">Version History</TabsTrigger>
            </TabsList>

            <TabsContent value="product-details">
              <SDSDetailsTab 
                initialData={initialData}
                isDG={initialData.isDG}
                setIsDG={() => {}}
                status={initialData.status}
                setStatus={() => {}}
                supplier={initialData.supplierId}
                setSupplier={() => {}}
                formData={{
                  productName: initialData.productName,
                  productId: initialData.productId,
                  otherNames: initialData.otherNames,
                  emergencyPhone: initialData.emergencyPhone,
                  issueDate: initialData.issueDate,
                  revisionDate: initialData.revisionDate,
                  expiryDate: initialData.expiryDate,
                  unNumber: initialData.unNumber,
                  unProperShippingName: initialData.unProperShippingName,
                  hazchemCode: initialData.hazchemCode,
                  requestSupplierName: initialData.requestSupplierName,
                  requestSupplierDetails: initialData.requestSupplierDetails,
                  requestInformation: initialData.requestInformation,
                  requestDate: initialData.requestDate,
                  requestedBy: initialData.requestedBy
                }}
                setFormData={() => {}}
                dgClassId={initialData.dgClassId || ""}
                setDgClassId={() => {}}
                subsidiaryDgClassId={initialData.subsidiaryDgClassId || ""}
                setSubsidiaryDgClassId={() => {}}
                packingGroupId={initialData.packingGroupId || ""}
                setPackingGroupId={() => {}}
                dgSubDivisionId={initialData.dgSubDivisionId || ""}
                setDgSubDivisionId={() => {}}
                readOnly={true}
              />
            </TabsContent>

            <TabsContent value="version">
              <SDSVersionTab onOpenSDS={handleOpenSDS} />
            </TabsContent>
          </Tabs>
        </div>

        <SDSPreview 
          onUploadClick={() => {}}
          initialData={initialData}
          selectedFile={null}
          readOnly={true}
        />
      </div>
    </div>
  );
}
