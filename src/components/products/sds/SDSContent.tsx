
import type { SDS } from "@/types/sds";
import { SDSSearchSection } from "./SDSSearchSection";
import { SDSDetailsDisplay } from "./SDSDetailsDisplay";
import { SDSPreview } from "@/components/sds/SDSPreview";

interface SDSContentProps {
  sdsId: string | null;
  initialSDS: SDS | null;
  onSDSSelect: (sds: SDS | SDS[]) => void;
  onNewSDSClick: () => void;
}

export function SDSContent({ sdsId, initialSDS, onSDSSelect, onNewSDSClick }: SDSContentProps) {
  return (
    <div className="grid grid-cols-[1fr,1fr] gap-6 h-full">
      <div className="space-y-6">
        <SDSSearchSection
          sdsId={sdsId}
          initialSDS={initialSDS}
          onSDSSelect={onSDSSelect}
          onNewSDSClick={onNewSDSClick}
        />

        {initialSDS && <SDSDetailsDisplay sds={initialSDS} />}
      </div>

      <div className="space-y-4 h-full sticky top-0">
        <div className="h-[calc(100vh-12rem)]">
          <SDSPreview
            initialData={initialSDS}
            selectedFile={null}
            onUploadClick={() => {}}
            readOnly={true}
          />
        </div>
      </div>
    </div>
  );
}
