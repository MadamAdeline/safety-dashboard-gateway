import { Label } from "@/components/ui/label";
import { SDSSearch } from "@/components/sds/SDSSearch";
import type { SDS } from "@/types/sds";

interface ProductSDSTabProps {
  sdsId: string | null;
  onSDSSelect: (sds: SDS | SDS[]) => void;
}

export function ProductSDSTab({ sdsId, onSDSSelect }: ProductSDSTabProps) {
  return (
    <div className="space-y-4">
      <Label>Associated SDS</Label>
      <SDSSearch
        selectedSdsId={sdsId}
        onSDSSelect={onSDSSelect}
      />
    </div>
  );
}