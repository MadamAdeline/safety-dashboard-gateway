import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UploadArea } from "./upload/UploadArea";
import { extractSDSData } from "./upload/SDSDataExtractor";

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
        <UploadArea 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onFileChange={handleFileChange}
        />
      </DialogContent>
    </Dialog>
  );
}