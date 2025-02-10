
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSDSRequest } from "@/hooks/use-sds-request";
import { SDSRequestForm } from "./SDSRequestForm";

interface SDSRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestComplete?: () => void;
}

export function SDSRequestDialog({ 
  open, 
  onOpenChange, 
  onRequestComplete 
}: SDSRequestDialogProps) {
  const { formData, setFormData, handleSubmit } = useSDSRequest(() => {
    onOpenChange(false);
    if (onRequestComplete) {
      onRequestComplete();
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Request SDS from DGXprt</DialogTitle>
        </DialogHeader>
        
        <SDSRequestForm 
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
