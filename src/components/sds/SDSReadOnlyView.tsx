
import type { SDS } from "@/types/sds";
import { SDSDetailsTab } from "./SDSDetailsTab";
import { SDSVersionTab } from "./SDSVersionTab";
import { SDSPreview } from "./SDSPreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SDSFormHeader } from "./SDSFormHeader";

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
    <div className="space-y-6 max-w-full">
      <SDSFormHeader
        title="View Safety Data Sheet"
        onClose={onClose}
        readOnly={true}
      />

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
