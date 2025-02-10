
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SDS } from "@/types/sds";
import { SDSFormHeader } from "./SDSFormHeader";
import { SDSDetailsTab } from "./SDSDetailsTab";
import { SDSVersionTab } from "./SDSVersionTab";
import { SDSPreview } from "./SDSPreview";
import { SDSRelatedProductsTab } from "./SDSRelatedProductsTab";

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
      <SDSFormHeader 
        title="View Safety Data Sheet"
        onClose={onClose}
        readOnly={true}
      />

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <Tabs defaultValue="product-details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="product-details">SDS Details</TabsTrigger>
              <TabsTrigger value="version">Version History</TabsTrigger>
              <TabsTrigger value="related-products">Related Products</TabsTrigger>
            </TabsList>

            <TabsContent value="product-details">
              <SDSDetailsTab 
                initialData={initialData}
                readOnly={true}
              />
            </TabsContent>

            <TabsContent value="version">
              <SDSVersionTab onOpenSDS={handleOpenSDS} />
            </TabsContent>

            <TabsContent value="related-products">
              <SDSRelatedProductsTab sds={initialData} />
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
