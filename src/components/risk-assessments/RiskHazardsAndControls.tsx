import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RiskHazardsAndControlsProps {
  riskAssessmentId: string | null;
  readOnly?: boolean;
}

export interface RiskHazardsAndControlsRef {
  handleAdd: () => void;
  saveHazards: (riskAssessmentId: string) => Promise<void>;
  populateHazards: (hazards: any[]) => void;
}

export const RiskHazardsAndControls = forwardRef<RiskHazardsAndControlsRef, RiskHazardsAndControlsProps>(
  ({ riskAssessmentId, readOnly = false }, ref) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [hazards, setHazards] = useState<any[]>([]);
    const [riskMatrix, setRiskMatrix] = useState<any[]>([]);
    const [hazardTypes, setHazardTypes] = useState<any[]>([]);

    const { data: siteRegister } = useQuery({
      queryKey: ['site-register', riskAssessmentId],
      queryFn: async () => {
        if (!riskAssessmentId) return null;
        const { data, error } = await supabase
          .from('risk_assessments')
          .select(`
            site_registers (
              id,
              product:products (
                id,
                product_name
              )
            )
          `)
          .eq('id', riskAssessmentId)
          .single();

        if (error) throw error;
        return data?.site_registers;
      },
      enabled: !!riskAssessmentId
    });

    const { data: likelihoodOptions } = useQuery({
      queryKey: ['likelihood-options'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('likelihood')
          .select('*')
          .order('score', { ascending: true });
        if (error) throw error;
        return data;
      }
    });

    const { data: consequenceOptions } = useQuery({
      queryKey: ['consequence-options'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('consequence')
          .select('*')
          .order('score', { ascending: true });
        if (error) throw error;
        return data;
      }
    });

    const { refetch: refetchHazards } = useQuery({
      queryKey: ['risk-hazards', riskAssessmentId],
      queryFn: async () => {
        if (!riskAssessmentId) return [];
        const { data, error } = await supabase
          .from('risk_hazards_and_controls')
          .select('*')
          .eq('risk_assessment_id', riskAssessmentId)
          .order('id');

        if (error) throw error;
        setHazards(data);
        return data;
      },
      enabled: !!riskAssessmentId
    });

    useEffect(() => {
      const fetchHazardTypes = async () => {
        const { data, error } = await supabase
          .from('master_data')
          .select('*')
          .eq('category', 'HAZARD_TYPE')
          .eq('status', 'ACTIVE')
          .order('sort_order');

        if (error) {
          console.error('Error fetching hazard types:', error);
          return;
        }

        setHazardTypes(data);
      };

      fetchHazardTypes();
    }, []);

    useEffect(() => {
      const fetchRiskMatrix = async () => {
        const { data, error } = await supabase
          .from('risk_matrix')
          .select('*');

        if (error) {
          console.error('Error fetching risk matrix:', error);
          return;
        }

        setRiskMatrix(data);
      };

      fetchRiskMatrix();
    }, []);

    useImperativeHandle(ref, () => ({
      handleAdd,
      saveHazards,
      populateHazards: (newHazards: any[]) => {
        setHazards(newHazards);
      }
    }));

    const handleAdd = () => {
      setHazards([
        ...hazards,
        {
          hazard_type_id: hazardTypes[0]?.id,
          hazard: "",
          control: "",
          likelihood_id: null,
          consequence_id: null,
          risk_score_id: null,
          control_in_place: false,
          source: "MANUAL"
        }
      ]);
    };

    const handleRemove = (index: number) => {
      setHazards(hazards.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, field: string, value: any) => {
      const updatedHazards = [...hazards];
      updatedHazards[index] = {
        ...updatedHazards[index],
        [field]: value
      };

      if (field === 'likelihood_id' || field === 'consequence_id') {
        const likelihood_id = field === 'likelihood_id' ? value : updatedHazards[index].likelihood_id;
        const consequence_id = field === 'consequence_id' ? value : updatedHazards[index].consequence_id;

        if (likelihood_id && consequence_id) {
          const riskScore = riskMatrix.find(
            (score) => score.likelihood_id === likelihood_id && score.consequence_id === consequence_id
          );

          if (riskScore) {
            updatedHazards[index].risk_score_id = riskScore.id;
          }
        }
      }

      setHazards(updatedHazards);
    };

    const saveHazards = async (riskAssessmentId: string) => {
      try {
        // Delete existing hazards
        const { error: deleteError } = await supabase
          .from('risk_hazards_and_controls')
          .delete()
          .eq('risk_assessment_id', riskAssessmentId);

        if (deleteError) throw deleteError;

        // Insert new hazards
        if (hazards.length > 0) {
          const hazardsToInsert = hazards.map(hazard => ({
            ...hazard,
            risk_assessment_id: riskAssessmentId
          }));

          const { error: insertError } = await supabase
            .from('risk_hazards_and_controls')
            .insert(hazardsToInsert);

          if (insertError) throw insertError;
        }

        queryClient.invalidateQueries({ queryKey: ['risk-hazards'] });
      } catch (error) {
        console.error('Error saving hazards:', error);
        throw error;
      }
    };

    const handleAutoGenerate = async () => {
      console.log('Auto-generating hazards for risk assessment:', riskAssessmentId);
      
      if (!riskAssessmentId || !siteRegister?.product?.id) {
        toast({
          title: "Error",
          description: "Cannot auto-generate hazards without a product selected",
          variant: "destructive"
        });
        return;
      }

      try {
        // Simply set the auto_generate_hazards flag to true
        const { error } = await supabase
          .from('risk_assessments')
          .update({ auto_generate_hazards: true })
          .eq('id', riskAssessmentId);

        if (error) throw error;

        // Small delay to allow trigger to complete
        await new Promise(resolve => setTimeout(resolve, 500));

        // Refetch the hazards to show the newly generated ones
        await refetchHazards();
        
        toast({
          title: "Success",
          description: "Hazards auto-generated successfully",
        });

      } catch (error) {
        console.error('Error auto-generating hazards:', error);
        toast({
          title: "Error",
          description: "Failed to auto-generate hazards",
          variant: "destructive"
        });
      }
    };

    return (
      <div className="space-y-4">
        {hazards.map((hazard, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 items-start border p-4 rounded-lg">
            <div className="col-span-2">
              <Label>Hazard Type</Label>
              <Select
                value={hazard.hazard_type_id}
                onValueChange={(value) => handleChange(index, 'hazard_type_id', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {hazardTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-3">
              <Label>Hazard</Label>
              <textarea
                className="w-full min-h-[80px] p-2 border rounded-md"
                value={hazard.hazard}
                onChange={(e) => handleChange(index, 'hazard', e.target.value)}
                disabled={readOnly}
              />
            </div>

            <div className="col-span-3">
              <Label>Control</Label>
              <textarea
                className="w-full min-h-[80px] p-2 border rounded-md"
                value={hazard.control}
                onChange={(e) => handleChange(index, 'control', e.target.value)}
                disabled={readOnly}
              />
            </div>

            <div className="col-span-1">
              <Label>Likelihood</Label>
              <Select
                value={hazard.likelihood_id?.toString()}
                onValueChange={(value) => handleChange(index, 'likelihood_id', parseInt(value))}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {likelihoodOptions?.map((option) => (
                    <SelectItem key={option.id} value={option.id.toString()}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-1">
              <Label>Consequence</Label>
              <Select
                value={hazard.consequence_id?.toString()}
                onValueChange={(value) => handleChange(index, 'consequence_id', parseInt(value))}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {consequenceOptions?.map((option) => (
                    <SelectItem key={option.id} value={option.id.toString()}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-1">
              <Label>Risk Score</Label>
              {hazard.risk_score_id && (
                <div className="h-10 flex items-center">
                  {riskMatrix.find(score => score.id === hazard.risk_score_id)?.risk_label || 'N/A'}
                </div>
              )}
            </div>

            <div className="col-span-1 space-y-2">
              <Label>Control in Place</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={hazard.control_in_place}
                  onCheckedChange={(checked) => handleChange(index, 'control_in_place', checked)}
                  disabled={readOnly}
                />
              </div>
            </div>

            {!readOnly && (
              <div className="flex items-end justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
);

RiskHazardsAndControls.displayName = "RiskHazardsAndControls";
