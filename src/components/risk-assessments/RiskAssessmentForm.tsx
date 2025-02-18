
import React from "react";
import { Button } from "@/components/ui/button";
import { RiskHazardsAndControls } from "./RiskHazardsAndControls";
import { SiteRegisterSearch } from "./SiteRegisterSearch";
import { useRef, useState } from "react";
import type { RiskHazardsAndControlsRef } from "./RiskHazardsAndControls";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");
  const [siteRegisterId, setSiteRegisterId] = useState<string | null>(
    initialData?.site_register_record_id || null
  );
  const [riskAssessmentId, setRiskAssessmentId] = useState<string | null>(
    initialData?.id || null
  );
  const [formData, setFormData] = useState({
    risk_assessment_date: initialData?.risk_assessment_date ? new Date(initialData.risk_assessment_date) : new Date(),
    date_of_next_review: initialData?.date_of_next_review ? new Date(initialData.date_of_next_review) : new Date(),
    product_usage: initialData?.product_usage || "",
    overall_evaluation: initialData?.overall_evaluation || "",
  });

  const handleSiteRegisterSelect = (record: any) => {
    setSiteRegisterId(record.id);
  };

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (riskAssessmentId) {
        const { error } = await supabase
          .from('risk_assessments')
          .update(data)
          .eq('id', riskAssessmentId);
        if (error) throw error;
      } else {
        const { data: newRiskAssessment, error } = await supabase
          .from('risk_assessments')
          .insert([{
            ...data,
            site_register_record_id: siteRegisterId,
          }])
          .select()
          .single();
        
        if (error) throw error;
        setRiskAssessmentId(newRiskAssessment.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-assessments'] });
      toast({
        title: "Success",
        description: "Risk assessment saved successfully",
      });
    },
    onError: (error) => {
      console.error("Error saving risk assessment:", error);
      toast({
        title: "Error",
        description: "Failed to save risk assessment",
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    try {
      // First save the main risk assessment data
      await updateMutation.mutateAsync({
        risk_assessment_date: formData.risk_assessment_date,
        date_of_next_review: formData.date_of_next_review,
        product_usage: formData.product_usage,
        overall_evaluation: formData.overall_evaluation,
      });

      // Then save the hazards if we're on the hazards tab
      if (activeTab === "hazards" && hazardsRef.current && riskAssessmentId) {
        await hazardsRef.current.saveHazards(riskAssessmentId);
      }

      onClose();
    } catch (error) {
      console.error("Error in handleSave:", error);
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="hazards">Hazards & Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4">
            <div>
              <SiteRegisterSearch
                onSelect={handleSiteRegisterSelect}
                selectedSiteRegisterId={siteRegisterId}
              />
            </div>

            <div className="grid gap-4">
              <div>
                <Label>Assessment Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.risk_assessment_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.risk_assessment_date ? (
                        format(formData.risk_assessment_date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.risk_assessment_date}
                      onSelect={(date) => setFormData(prev => ({ ...prev, risk_assessment_date: date || new Date() }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Next Review Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date_of_next_review && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date_of_next_review ? (
                        format(formData.date_of_next_review, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date_of_next_review}
                      onSelect={(date) => setFormData(prev => ({ ...prev, date_of_next_review: date || new Date() }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Product Usage</Label>
                <Input
                  value={formData.product_usage}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_usage: e.target.value }))}
                  placeholder="Enter product usage details"
                />
              </div>

              <div>
                <Label>Overall Evaluation</Label>
                <Input
                  value={formData.overall_evaluation}
                  onChange={(e) => setFormData(prev => ({ ...prev, overall_evaluation: e.target.value }))}
                  placeholder="Enter overall evaluation"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hazards">
          <RiskHazardsAndControls
            ref={hazardsRef}
            riskAssessmentId={riskAssessmentId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
