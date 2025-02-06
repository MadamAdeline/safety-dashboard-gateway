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
import { createSDS, updateSDS, uploadSDSFile, getStatusId } from "@/services/sds";
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
  const [supplier, setSupplier] = useState("");
  const [formData, setFormData] = useState({
    productName: initialData?.productName ?? "",
    productId: initialData?.productId ?? "",
    otherNames: initialData?.otherNames ?? "",
    emergencyPhone: initialData?.emergencyPhone ?? "",
    issueDate: initialData?.issueDate ?? "",
    revisionDate: initialData?.revisionDate ?? "",
    expiryDate: initialData?.expiryDate ?? "",
    dgClassId: initialData?.dgClassId ?? "",
    unNumber: initialData?.unNumber ?? "",
    unProperShippingName: initialData?.unProperShippingName ?? "",
    packingGroupId: initialData?.packingGroupId ?? "",
    hazchemCode: initialData?.hazchemCode ?? "",
    subsidiaryDgClassId: initialData?.subsidiaryDgClassId ?? "",
    dgSubDivisionId: initialData?.dgSubDivisionId ?? ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialData) {
      setIsDG(initialData.isDG);
      setStatus(initialData.status);
      setFormData({
        productName: initialData.productName,
        productId: initialData.productId,
        otherNames: initialData.otherNames ?? "",
        emergencyPhone: initialData.emergencyPhone ?? "",
        issueDate: initialData.issueDate,
        revisionDate: initialData.revisionDate ?? "",
        expiryDate: initialData.expiryDate,
        dgClassId: initialData.dgClassId ?? "",
        unNumber: initialData.unNumber ?? "",
        unProperShippingName: initialData.unProperShippingName ?? "",
        packingGroupId: initialData.packingGroupId ?? "",
        hazchemCode: initialData.hazchemCode ?? "",
        subsidiaryDgClassId: initialData.subsidiaryDgClassId ?? "",
        dgSubDivisionId: initialData.dgSubDivisionId ?? ""
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
          productName: extractedData.productName || "",
          productId: extractedData.productId || "",
          dgClassId: extractedData.dgClassId || "",
          unNumber: extractedData.unNumber || "",
          unProperShippingName: extractedData.unProperShippingName || "",
          packingGroupId: extractedData.packingGroupId || "",
          hazchemCode: extractedData.hazchemCode || "",
          subsidiaryDgClassId: extractedData.subsidiaryDgClassId || "",
          dgSubDivisionId: extractedData.dgSubDivisionId || ""
        }));
      }
    }
  };

  const handleOpenSDS = () => {
    // If there's a file path in initialData, we can open it
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
      console.log("Starting SDS save process");
      console.log("Form data being saved:", formData);
      
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
        fileData = await uploadSDSFile(selectedFile);
        console.log("File uploaded successfully:", fileData);
      }

      const statusId = await getStatusId(status);
      console.log("Retrieved status ID:", statusId);

      const sdsData = {
        productName: formData.productName,
        productId: formData.productId,
        otherNames: formData.otherNames,
        emergencyPhone: formData.emergencyPhone,
        supplierId: supplier,
        isDG,
        issueDate: formData.issueDate,
        revisionDate: formData.revisionDate,
        expiryDate: formData.expiryDate,
        dgClassId: isDG ? formData.dgClassId : null,
        unNumber: isDG ? formData.unNumber : null,
        unProperShippingName: isDG ? formData.unProperShippingName : null,
        packingGroupId: isDG ? formData.packingGroupId : null,
        hazchemCode: isDG ? formData.hazchemCode : null,
        subsidiaryDgClassId: isDG ? formData.subsidiaryDgClassId : null,
        dgSubDivisionId: isDG ? formData.dgSubDivisionId : null,
        statusId,
        ...(fileData && {
          currentFilePath: fileData.filePath,
          currentFileName: fileData.fileName,
          currentFileSize: fileData.fileSize,
          currentContentType: fileData.contentType
        })
      };

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
                <SDSVersionTab onOpenSDS={handleOpenSDS} />
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
