
import { Label } from "@/components/ui/label";
import type { SDS } from "@/types/sds";
import { format } from "date-fns";

interface SDSDetailsDisplayProps {
  sds: SDS;
}

export function SDSDetailsDisplay({ sds }: SDSDetailsDisplayProps) {
  return (
    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
      <div className="space-y-2">
        <Label>SDS Product Code</Label>
        <div className="p-2 bg-white rounded border">{sds.productId}</div>
      </div>
      
      <div className="space-y-2">
        <Label>SDS Expiry Date</Label>
        <div className="p-2 bg-white rounded border">
          {sds.expiryDate ? format(new Date(sds.expiryDate), 'dd/MM/yyyy') : 'N/A'}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Supplier Name</Label>
        <div className="p-2 bg-white rounded border">{sds.supplier}</div>
      </div>
      
      <div className="space-y-2">
        <Label>Is Dangerous Goods</Label>
        <div className="p-2 bg-white rounded border">
          {sds.isDG ? 'Yes' : 'No'}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>DG Class</Label>
        <div className="p-2 bg-white rounded border">
          {sds.dgClass?.label || 'N/A'}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>DG Sub Division</Label>
        <div className="p-2 bg-white rounded border">
          {sds.dgSubDivision?.label || 'N/A'}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Packing Group</Label>
        <div className="p-2 bg-white rounded border">
          {sds.packingGroup?.label || 'N/A'}
        </div>
      </div>
    </div>
  );
}
