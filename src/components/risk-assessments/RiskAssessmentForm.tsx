
import React from "react";
import { Button } from "@/components/ui/button";
import { RiskHazardsAndControls } from "./RiskHazardsAndControls";
import { SiteRegisterSearch } from "./SiteRegisterSearch";
import { useRef, useState } from "react";
import type { RiskHazardsAndControlsRef } from "./RiskHazardsAndControls";
import { useToast } from "@/hooks/use-toast";

interface RiskAssessmentFormProps {
  onClose: () => void;
  initialData?: any;
}

export const RiskAssessmentForm: React.FC<RiskAssessmentFormProps> = ({
  onClose,
  initialData,
}) => {
  const hazardsRef = useRef<RiskHazardsAndControlsRef>(null);
  const { toast } = useToast();
  const [siteRegisterId, setSiteRegisterId] = useState<string | null>(
    initialData?.site_register_record_id || null
  );
  const [riskAssessmentId, setRiskAssessmentId] = useState<string | null>(
    initialData?.id || null
  );

  const handleSiteRegisterSelect = (record: any) => {
    setSiteRegisterId(record.id);
  };

  const handleSave = async () => {
    if (!hazardsRef.current) return;

    try {
      if (riskAssessmentId) {
        await hazardsRef.current.saveHazards(riskAssessmentId);
        toast({
          title: "Success",
          description: "Risk assessment saved successfully",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error saving risk assessment:", error);
      toast({
        title: "Error",
        description: "Failed to save risk assessment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {initialData ? "Edit" : "New"} Risk Assessment
        </h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <SiteRegisterSearch
            onSelect={handleSiteRegisterSelect}
            selectedSiteRegisterId={initialData?.site_register_record_id}
          />
        </div>

        <div>
          <RiskHazardsAndControls
            ref={hazardsRef}
            riskAssessmentId={riskAssessmentId}
          />
        </div>
      </div>
    </div>
  );
};
