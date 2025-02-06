import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import type { SDS } from "@/types/sds";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface SDSPreviewProps {
  onUploadClick: () => void;
  initialData?: SDS | null;
  selectedFile: File | null;
}

export function SDSPreview({ onUploadClick, initialData, selectedFile }: SDSPreviewProps) {
  const isGlobalLibrary = initialData?.sdsSource === "Global Library";
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdfUrl = async () => {
      if (initialData?.currentFilePath) {
        console.log('Fetching PDF URL for path:', initialData.currentFilePath);
        const { data } = supabase.storage
          .from('sds_documents')
          .getPublicUrl(initialData.currentFilePath);
        
        if (data) {
          console.log('Retrieved public URL:', data.publicUrl);
          setPdfUrl(data.publicUrl);
        }
      }
    };

    fetchPdfUrl();
  }, [initialData]);

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
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="SDS PDF Preview"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-600">No PDF uploaded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}