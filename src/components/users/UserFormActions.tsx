import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface UserFormActionsProps {
  onClose: () => void;
  onSave: () => void;
  isLoading: boolean;
}

export function UserFormActions({ onClose, onSave, isLoading }: UserFormActionsProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button 
        className="bg-dgxprt-purple hover:bg-dgxprt-purple/90" 
        onClick={onSave}
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : "Save"}
      </Button>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}