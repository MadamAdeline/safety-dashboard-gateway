import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SDSUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SDSUploadDialog({ open, onOpenChange, onFileUpload }: SDSUploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload SDS Documents</DialogTitle>
        </DialogHeader>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
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
              onChange={onFileUpload}
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