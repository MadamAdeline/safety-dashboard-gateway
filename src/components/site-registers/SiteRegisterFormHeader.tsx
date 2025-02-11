
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SiteRegisterFormHeaderProps {
  isEditing: boolean;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export function SiteRegisterFormHeader({ isEditing, onClose, onSave, isSaving }: SiteRegisterFormHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">
        {isEditing ? "Edit Site Register" : "New Site Register"}
      </h1>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button 
          className="bg-dgxprt-purple hover:bg-dgxprt-purple/90" 
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose} disabled={isSaving}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
