import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { SDS } from "@/types/sds";
import { SDSFormHeader } from "./SDSFormHeader";
import { SDSDetailsTab } from "./SDSDetailsTab";
import { SDSVersionTab } from "./SDSVersionTab";
import { SDSPreview } from "./SDSPreview";
import { SDSUploadDialog } from "./SDSUploadDialog";
import { createSDS, uploadSDSFile, getStatusId } from "@/services/sds";
import { useQueryClient } from "@tanstack/react-query";

interface NewSDSFormProps {
  onClose: () => void;
  initialData?: SDS | null;
}

export function NewSDSForm({ onClose, initialData }: NewSDSFormProps) {
  const [isDG, setIsDG] = useState(initialData?.isDG ?? false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "REQUESTED">(initialData?.status ?? 'ACTIVE');
  const [supplier, setSupplier] = useState(initialData?.supplier ?? "");
  const [formData, setFormData] = useState({
    productName: initialData?.productName ?? "",
    productId: initialData?.productId ?? "",
    issueDate: initialData?.issueDate ?? "",
    expiryDate: initialData?.expiryDate ?? "",
    dgClass: initialData?.dgClass,
    unNumber: "",
    unProperShippingName: "",
    packingGroup: "",
    hazchemCode: "",
    subsidiaryDgClass: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialData) {
      setIsDG(initialData.isDG);
      setStatus(initialData.status);
      setSupplier(initialData.supplier);
      setFormData({
        productName: initialData.productName,
        productId: initialData.productId,
        issueDate: initialData.issueDate,
        expiryDate: initialData.expiryDate,
        dgClass: initialData.dgClass,
        unNumber: "",
        unProperShippingName: "",
        packingGroup: "",
        hazchemCode: "",
        subsidiaryDgClass: ""
      });
    }
  }, [initialData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, extractedData?: any) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowUploadDialog(false);
      console.log("File selected:", file.name);

      if (extractedData) {
        console.log("Extracted data:", extractedData);
        setIsDG(true);
        setFormData(prev => ({
          ...prev,
          productName: extractedData.productName,
          productId: extractedData.productId,
          dgClass: extractedData.dgClass,
          unNumber: extractedData.unNumber,
          unProperShippingName: extractedData.unProperShippingName,
          packingGroup: extractedData.packingGroup,
          hazchemCode: extractedData.hazchemCode,
          subsidiaryDgClass: extractedData.subsidiaryDgClass
        }));
      }
    }
  };

  const handleSave = async () => {
    try {
      console.log("Starting SDS save process");
      
      let fileData = null;
      if (selectedFile) {
        fileData = await uploadSDSFile(selectedFile);
        console.log("File uploaded successfully:", fileData);
      }

      const statusId = await getStatusId(status);
      console.log("Retrieved status ID:", statusId);

      await createSDS({
        productName: formData.productName,
        productId: formData.productId,
        supplierId: supplier, // Use the selected supplier ID directly
        isDG,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate,
        dgClass: isDG ? formData.dgClass : undefined,
        statusId,
        ...(fileData && {
          currentFilePath: fileData.filePath,
          currentFileName: fileData.fileName,
          currentFileSize: fileData.fileSize,
          currentContentType: fileData.contentType
        })
      });

      toast({
        title: "Success",
        description: "SDS Record has been saved"
      });

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

  const openSDSInNewTab = () => {
    window.open("/lovable-uploads/efad172c-780d-4fdb-ba96-baa5719330bc.png", '_blank');
  };

  return (
    <DashboardLayout>
      <div className="max-w-full">
        <SDSFormHeader 
          title={initialData ? "Edit Safety Data Sheet" : "New Safety Data Sheet"}
          onClose={onClose}
          onSave={handleSave}
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
                />
              </TabsContent>

              <TabsContent value="version">
                <SDSVersionTab onOpenSDS={openSDSInNewTab} />
              </TabsContent>
            </Tabs>
          </div>

          <SDSPreview 
            onUploadClick={() => setShowUploadDialog(true)} 
            initialData={initialData}
            selectedFile={selectedFile}
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
