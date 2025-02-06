import { Label } from "@/components/ui/label";
import { SDSSearch } from "@/components/sds/SDSSearch";
import type { SDS } from "@/types/sds";

interface ProductSDSTabProps {
  sdsId: string | null;
  onSDSSelect: (sds: SDS | SDS[]) => void;
}

export function ProductSDSTab({ sdsId, onSDSSelect }: ProductSDSTabProps) {
  return (
    <div className="space-y-4 w-full">
      <Label>Associated SDS</Label>
      <SDSSearch
        selectedSdsId={sdsId}
        onSDSSelect={onSDSSelect}
        className="w-full"
      />
    </div>
  );
}