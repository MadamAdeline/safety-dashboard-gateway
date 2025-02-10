
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadAreaProps {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadArea({ onDragOver, onDrop, onFileChange }: UploadAreaProps) {
  const handleButtonClick = () => {
    // Programmatically click the hidden file input
    document.getElementById('sdsUpload')?.click();
  };

  return (
    <div 
      className="border-2 border-dashed border-gray-300 rounded-lg p-8"
      onDragOver={onDragOver}
      onDrop={onDrop}
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
          onChange={onFileChange}
        />
        <Button 
          variant="secondary" 
          className="cursor-pointer"
          onClick={handleButtonClick}
        >
          Choose file
        </Button>
      </div>
    </div>
  );
}
