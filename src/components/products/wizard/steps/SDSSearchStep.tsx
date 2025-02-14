
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GlobalSDSSearchDialog } from "@/components/sds/GlobalSDSSearchDialog";
import { NewSDSForm } from "@/components/sds/NewSDSForm";
import type { Supplier } from "@/types/supplier";
import type { SDS } from "@/types/sds";

interface SDSSearchStepProps {
  supplier: Supplier | null;
  onSDSSelect: (sds: SDS) => void;
  selectedSDS: SDS | null;
}

export function SDSSearchStep({ supplier, onSDSSelect, selectedSDS }: SDSSearchStepProps) {
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);

  if (!supplier) return null;

  if (showNewForm) {
    return (
      <NewSDSForm 
        onClose={() => setShowNewForm(false)}
        initialSupplier={supplier}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Step 2: Find or Create SDS</h3>
        <p className="text-gray-600">
          Search for an existing SDS in our global library or create a new one.
        </p>
      </div>

      <div className="flex flex-col gap-4 items-center justify-center p-8 border-2 border-dashed rounded-lg">
        <Button
          onClick={() => setShowGlobalSearch(true)}
          className="bg-dgxprt-purple hover:bg-dgxprt-purple/90 w-64"
        >
          Search Global Library
        </Button>
        <span className="text-gray-500">or</span>
        <Button
          variant="outline"
          onClick={() => setShowNewForm(true)}
          className="w-64"
        >
          <Plus className="mr-2 h-4 w-4" /> Create New SDS
        </Button>
      </div>

      <GlobalSDSSearchDialog
        open={showGlobalSearch}
        onOpenChange={setShowGlobalSearch}
        onSDSSelect={(sds) => {
          if (Array.isArray(sds)) {
            onSDSSelect(sds[0]);
          } else {
            onSDSSelect(sds);
          }
          setShowGlobalSearch(false);
        }}
      />
    </div>
  );
}
