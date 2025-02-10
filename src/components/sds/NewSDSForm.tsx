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

interface NewSDSFormProps {
  onClose: () => void;
  initialData?: SDS | null;
  readOnly?: boolean;
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

export function NewSDSForm({ onClose, initialData, readOnly = false }: NewSDSFormProps) {
  console.log("NewSDSForm - Initial Data:", initialData);

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

  const handleSave = async () => {
    try {
      if (!supplier) {
        toast({
          title: "Error",
          description: "Please select a supplier",
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
    <DashboardLayout>
      <div className="max-w-full">
        <SDSFormHeader 
          title={initialData ? "Edit Safety Data Sheet" : "New Safety Data Sheet"}
          onClose={onClose}
          onSave={!readOnly ? handleSave : undefined}
          readOnly={readOnly}
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
                  readOnly={readOnly}
                />
              </TabsContent>

              <TabsContent value="version">
                <SDSVersionTab onOpenSDS={handleOpenSDS} />
              </TabsContent>
            </Tabs>
          </div>

          <SDSPreview 
            onUploadClick={() => !readOnly && setShowUploadDialog(true)} 
            initialData={initialData}
            selectedFile={selectedFile}
            readOnly={readOnly}
          />
        </div>
      </div>

      <SDSUploadDialog 
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onFileUpload={handleFileUpload}
      />
    </DashboardLayout>
  );
}
