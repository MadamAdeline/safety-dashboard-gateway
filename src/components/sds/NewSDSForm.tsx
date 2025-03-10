import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { SDS } from "@/types/sds";
import { SDSFormHeader } from "./SDSFormHeader";
import { SDSDetailsTab } from "./SDSDetailsTab";
import { SDSVersionTab } from "./SDSVersionTab";
import { SDSPreview } from "./SDSPreview";
import { SDSUploadDialog } from "./SDSUploadDialog";
import { createSDS, updateSDS, uploadSDSFile, getStatusId } from "@/services/sds";
import { useQueryClient } from "@tanstack/react-query";
import { format, addYears } from "date-fns";
import { useUserRole } from "@/hooks/use-user-role";
import { SDSRelatedProductsTab } from "./SDSRelatedProductsTab";
import { SDSGHSInformationTab } from "./SDSGHSInformationTab";

interface NewSDSFormProps {
  onClose: () => void;
  initialData?: SDS | null;
}

interface FormData {
  productName: string;
  productId: string;
  otherNames: string;
  emergencyPhone: string;
  issueDate: string;
  revisionDate: string;
  expiryDate: string;
  unNumber: string;
  unProperShippingName: string;
  hazchemCode: string;
  requestSupplierName: string;
  requestSupplierDetails: string;
  requestInformation: string;
  requestDate: string;
  requestedBy: string;
}

export function NewSDSForm({ onClose, initialData }: NewSDSFormProps) {
  console.log("NewSDSForm - Initial Data:", initialData);
  const { data: userRole } = useUserRole();
  const isManager = userRole?.role?.toLowerCase() === 'manager';
  console.log("User role:", userRole?.role);
  console.log("Is manager:", isManager);

  const [isDG, setIsDG] = useState(initialData?.isDG ?? false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "REQUESTED">(initialData?.status ?? 'ACTIVE');
  const [supplier, setSupplier] = useState(initialData?.supplierId ?? "");
  const [dgClassId, setDgClassId] = useState(initialData?.dgClassId ?? "");
  const [subsidiaryDgClassId, setSubsidiaryDgClassId] = useState(initialData?.subsidiaryDgClassId ?? "");
  const [packingGroupId, setPackingGroupId] = useState(initialData?.packingGroupId ?? "");
  const [dgSubDivisionId, setDgSubDivisionId] = useState(initialData?.dgSubDivisionId ?? "");
  
  const today = new Date();
  const [formData, setFormData] = useState<FormData>({
    productName: initialData?.productName ?? "",
    productId: initialData?.productId ?? "",
    otherNames: initialData?.otherNames ?? "",
    emergencyPhone: initialData?.emergencyPhone ?? "",
    issueDate: initialData?.issueDate ?? format(today, 'yyyy-MM-dd'),
    revisionDate: initialData?.revisionDate ?? "",
    expiryDate: initialData?.expiryDate ?? format(addYears(today, 5), 'yyyy-MM-dd'),
    unNumber: initialData?.unNumber ?? "",
    unProperShippingName: initialData?.unProperShippingName ?? "",
    hazchemCode: initialData?.hazchemCode ?? "",
    requestSupplierName: initialData?.requestSupplierName ?? "",
    requestSupplierDetails: initialData?.requestSupplierDetails ?? "",
    requestInformation: initialData?.requestInformation ?? "",
    requestDate: initialData?.requestDate ?? "",
    requestedBy: initialData?.requestedBy ?? ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, extractedData?: any) => {
    if (isManager) return;
    
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowUploadDialog(false);
      console.log("File selected:", file.name);

      if (!initialData && extractedData && !formData.productName && !formData.productId) {
        console.log("New record with blank fields - applying extracted data:", extractedData);
        setIsDG(true);
        setFormData(prev => ({
          ...prev,
          ...extractedData
        }));
      } else {
        console.log("Skipping data extraction - existing record or fields not blank");
      }
    }
  };

  const handleOpenSDS = () => {
    if (initialData?.currentFilePath) {
      window.open(initialData.currentFilePath, '_blank');
    } else {
      toast({
        title: "No SDS File",
        description: "There is no SDS file available to view.",
        variant: "destructive"
      });
    }
  };

  const validateForm = (): string[] => {
    const missingFields: string[] = [];
    if (!formData.productName) missingFields.push("Product Name");
    if (!formData.productId) missingFields.push("Product ID");
    if (!formData.issueDate) missingFields.push("Issue Date");
    if (!formData.expiryDate) missingFields.push("Expiry Date");
    
    // Only validate DG-related fields if isDG is true
    if (isDG) {
      if (!formData.unNumber) missingFields.push("UN Number");
      if (!formData.unProperShippingName) missingFields.push("UN Proper Shipping Name");
      if (!formData.hazchemCode) missingFields.push("Hazchem Code");
    }
    
    return missingFields;
  };

  const handleSave = async () => {
    if (isManager) {
      toast({
        title: "Read Only",
        description: "You don't have permission to modify this SDS.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Validate form
      const missingFields = validateForm();
      if (missingFields && missingFields.length > 0) {
        toast({
          title: "Required Fields Missing",
          description: `Please fill in the following required fields:\n${missingFields.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      let fileData = null;
      if (selectedFile) {
        console.log("Uploading file:", selectedFile.name);
        fileData = await uploadSDSFile(selectedFile);
        console.log("File uploaded successfully:", fileData);
      }

      const statusId = await getStatusId(status);
      console.log("Retrieved status ID:", statusId);

      // Determine the source based on status
      const source = status === "REQUESTED" ? "Global Library" : "Customer";

      const sdsData = {
        productName: formData.productName,
        productId: formData.productId,
        otherNames: formData.otherNames || null,
        emergencyPhone: formData.emergencyPhone || null,
        supplierId: supplier,
        isDG,
        issueDate: formData.issueDate,
        revisionDate: formData.revisionDate || null,
        expiryDate: formData.expiryDate,
        dgClassId: isDG ? dgClassId || null : null,
        subsidiaryDgClassId: isDG ? subsidiaryDgClassId || null : null,
        packingGroupId: isDG ? packingGroupId || null : null,
        dgSubDivisionId: isDG ? dgSubDivisionId || null : null,
        unNumber: isDG ? formData.unNumber || null : null,
        unProperShippingName: isDG ? formData.unProperShippingName || null : null,
        hazchemCode: isDG ? formData.hazchemCode || null : null,
        statusId,
        source,
        requestSupplierName: formData.requestSupplierName || null,
        requestSupplierDetails: formData.requestSupplierDetails || null,
        requestInformation: formData.requestInformation || null,
        requestDate: formData.requestDate || null,
        requestedBy: formData.requestedBy || null,
        ...(fileData && {
          currentFilePath: fileData.filePath,
          currentFileName: fileData.fileName,
          currentFileSize: fileData.fileSize,
          currentContentType: fileData.contentType
        }),
        ...(!fileData && initialData && {
          currentFilePath: initialData.currentFilePath,
          currentFileName: initialData.currentFileName,
          currentFileSize: initialData.currentFileSize,
          currentContentType: initialData.currentContentType
        })
      };

      console.log("Saving SDS with data:", sdsData);

      if (initialData?.id) {
        await updateSDS(initialData.id, sdsData);
        toast({
          title: "Success",
          description: "SDS Record has been updated"
        });
      } else {
        await createSDS(sdsData);
        toast({
          title: "Success",
          description: "SDS Record has been created"
        });
      }

      queryClient.invalidateQueries({ queryKey: ['sds'] });
      onClose();
    } catch (error) {
      console.error("Error saving SDS:", error);
      toast({
        title: "Error",
        description: "Failed to save SDS record",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-full">
      <SDSFormHeader 
        title={initialData ? "Edit Safety Data Sheet" : "New Safety Data Sheet"}
        onClose={onClose}
        onSave={!isManager ? handleSave : undefined}
        readOnly={isManager}
      />

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <Tabs defaultValue="product-details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="product-details">SDS Details</TabsTrigger>
              <TabsTrigger value="version">Version History</TabsTrigger>
              <TabsTrigger value="related-products">Related Products</TabsTrigger>
              <TabsTrigger value="ghs-information">GHS Information</TabsTrigger>
            </TabsList>

            <TabsContent value="product-details">
              <SDSDetailsTab 
                initialData={initialData}
                isDG={isDG}
                setIsDG={setIsDG}
                status={status}
                setStatus={setStatus}
                supplier={supplier}
                setSupplier={setSupplier}
                formData={formData}
                setFormData={setFormData}
                dgClassId={dgClassId}
                setDgClassId={setDgClassId}
                subsidiaryDgClassId={subsidiaryDgClassId}
                setSubsidiaryDgClassId={setSubsidiaryDgClassId}
                packingGroupId={packingGroupId}
                setPackingGroupId={setPackingGroupId}
                dgSubDivisionId={dgSubDivisionId}
                setDgSubDivisionId={setDgSubDivisionId}
                readOnly={isManager}
              />
            </TabsContent>

            <TabsContent value="version">
              <SDSVersionTab onOpenSDS={handleOpenSDS} />
            </TabsContent>

            <TabsContent value="related-products">
              {initialData && <SDSRelatedProductsTab sds={initialData} />}
              {!initialData && (
                <div className="text-center p-4 text-gray-500">
                  Related products will be available after saving the SDS.
                </div>
              )}
            </TabsContent>

            <TabsContent value="ghs-information">
              {initialData && <SDSGHSInformationTab sds={initialData} readOnly={isManager} />}
              {!initialData && (
                <div className="text-center p-4 text-gray-500">
                  GHS Information will be available after saving the SDS.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <SDSPreview 
          onUploadClick={() => !isManager && setShowUploadDialog(true)} 
          initialData={initialData}
          selectedFile={selectedFile}
          readOnly={isManager}
        />
      </div>

      <SDSUploadDialog 
        open={showUploadDialog} 
        onOpenChange={setShowUploadDialog}
        onFileUpload={handleFileUpload}
      />
    </div>
  );
}
