import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SDSUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, extractedData?: any) => void;
}

export function SDSUploadDialog({ open, onOpenChange, onFileUpload }: SDSUploadDialogProps) {
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const extractSDSData = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Attempting to extract SDS data from PDF');
      const response = await supabase.functions.invoke('extract-sds-data', {
        body: formData,
      });

      if (!response.error) {
        console.log('Successfully extracted SDS data:', response.data);
        return response.data;
      } else {
        throw new Error(response.error.message);
      }
    } catch (error) {
      console.error('Error extracting SDS data:', error);
      toast({
        title: "Warning",
        description: "Could not extract data from PDF. Please fill in the fields manually.",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        const extractedData = await extractSDSData(file);
        const event = {
          target: {
            files: [file]
          }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onFileUpload(event, extractedData);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive"
        });
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const extractedData = await extractSDSData(file);
      onFileUpload(e, extractedData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload SDS Documents</DialogTitle>
        </DialogHeader>
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <Upload className="h-10 w-10 text-gray-400" />
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF files only</p>
            </div>
            <input
              type="file"
              id="sdsUpload"
              className="hidden"
              accept=".pdf"
              onChange={handleFileChange}
            />
            <label htmlFor="sdsUpload">
              <Button variant="secondary" className="cursor-pointer">
                Choose file
              </Button>
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}