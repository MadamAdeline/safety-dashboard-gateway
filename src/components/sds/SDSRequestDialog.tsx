import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface SDSRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SDSRequestDialog({ open, onOpenChange }: SDSRequestDialogProps) {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting SDS request");
    
    // Here you would typically send the email to DGXprt's team
    
    toast({
      title: "Request Submitted",
      description: "Your SDS request has been sent to the DGXprt team.",
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Request SDS from DGXprt</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName">SDS Product Name</Label>
            <Input id="productName" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="productCode">SDS Product Code</Label>
            <Input id="productCode" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="otherProductName">Other Product Name</Label>
            <Input id="otherProductName" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="supplierName">Supplier Name</Label>
            <Input id="supplierName" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="otherSupplierDetails">Other Supplier Details, if known</Label>
            <Textarea id="otherSupplierDetails" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="requestInfo">Request Information</Label>
            <Textarea id="requestInfo" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="user">User</Label>
            <Input id="user" value="Current User" readOnly className="bg-gray-100" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="requestDate">Request Date</Label>
            <Input 
              id="requestDate" 
              value={format(new Date(), "yyyy-MM-dd")} 
              readOnly 
              className="bg-gray-100" 
            />
          </div>
          
          <Button type="submit" className="w-full">Submit Request</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}