import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface SDSPreviewProps {
  onUploadClick: () => void;
}

export function SDSPreview({ onUploadClick }: SDSPreviewProps) {
  return (
    <div className="space-y-4">
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

      <div className="border rounded-lg p-4 bg-white">
        <h2 className="text-lg font-semibold mb-4">PDF Preview</h2>
        <div className="aspect-[1/1.4] bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src="/lovable-uploads/efad172c-780d-4fdb-ba96-baa5719330bc.png" 
            alt="SDS Preview"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}