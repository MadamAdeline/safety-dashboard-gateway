
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SDSSearch } from "@/components/sds/SDSSearch";
import type { SDS } from "@/types/sds";

interface SDSSearchSectionProps {
  sdsId: string | null;
  initialSDS: SDS | null;
  onSDSSelect: (sds: SDS | SDS[]) => void;
  onNewSDSClick: () => void;
}

export function SDSSearchSection({ 
  sdsId, 
  initialSDS, 
  onSDSSelect, 
  onNewSDSClick 
}: SDSSearchSectionProps) {
  return (
    <div className="space-y-4">
      <Label>Associated SDS</Label>
      <div className="flex gap-2">
        <SDSSearch
          selectedSdsId={sdsId}
          initialSDS={initialSDS}
          onSDSSelect={onSDSSelect}
          className="w-full"
          activeOnly={true}
        />
        <Button
          onClick={onNewSDSClick}
          className="bg-dgxprt-purple hover:bg-dgxprt-purple/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> New SDS
        </Button>
      </div>
    </div>
  );
}
