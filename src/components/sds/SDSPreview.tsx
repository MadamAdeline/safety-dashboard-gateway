import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import type { SDS } from "@/types/sds";

interface SDSPreviewProps {
  onUploadClick: () => void;
  initialData?: SDS | null;
  selectedFile: File | null;
}

export function SDSPreview({ onUploadClick, initialData, selectedFile }: SDSPreviewProps) {
  const isGlobalLibrary = initialData?.sdsSource === "Global Library";

  return (
    <div className="space-y-4">
      {!isGlobalLibrary && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            className="cursor-pointer"
            onClick={onUploadClick}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload SDS
          </Button>
        </div>
      )}

      <div className="border rounded-lg p-4 bg-white">
        <h2 className="text-lg font-semibold mb-4">PDF Preview</h2>
        <div className="aspect-[1/1.4] bg-gray-100 rounded-lg overflow-hidden">
          {selectedFile ? (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-600">Selected file: {selectedFile.name}</p>
            </div>
          ) : (
            <img 
              src="/lovable-uploads/efad172c-780d-4fdb-ba96-baa5719330bc.png" 
              alt="SDS Preview"
              className="w-full h-full object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}