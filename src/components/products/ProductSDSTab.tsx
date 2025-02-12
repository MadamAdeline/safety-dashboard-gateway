
import { useState } from "react";
import { NewSDSForm } from "@/components/sds/NewSDSForm";
import type { SDS } from "@/types/sds";
import { useSDSDetails } from "@/hooks/use-sds-details";
import { SDSContent } from "./sds/SDSContent";

interface ProductSDSTabProps {
  sdsId: string | null;
  onSDSSelect: (sds: SDS | SDS[]) => void;
}

export function ProductSDSTab({ sdsId, onSDSSelect }: ProductSDSTabProps) {
  const [showNewSDS, setShowNewSDS] = useState(false);
  const { initialSDS, refreshSDS } = useSDSDetails(sdsId);

  const handleNewSDSClose = () => {
    setShowNewSDS(false);
    refreshSDS();
  };

  if (showNewSDS) {
    return (
      <div className="w-full -mx-6">
        <NewSDSForm onClose={handleNewSDSClose} />
      </div>
    );
  }

  return (
    <SDSContent
      sdsId={sdsId}
      initialSDS={initialSDS}
      onSDSSelect={onSDSSelect}
      onNewSDSClick={() => setShowNewSDS(true)}
    />
  );
}
