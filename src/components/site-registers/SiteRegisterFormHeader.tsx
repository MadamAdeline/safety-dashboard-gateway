
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SiteRegisterFormHeaderProps {
  isEditing: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function SiteRegisterFormHeader({ isEditing, onClose, onSave }: SiteRegisterFormHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">
        {isEditing ? "Edit Site Register" : "New Site Register"}
      </h1>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          className="bg-dgxprt-purple hover:bg-dgxprt-purple/90" 
          onClick={onSave}
        >
          Save
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
