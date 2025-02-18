import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { forwardRef, useImperativeHandle } from "react";
import { useMutation } from "@tanstack/react-query";

interface RiskHazardsAndControlsProps {
  riskAssessmentId: string | null;
  readOnly?: boolean;
}

export const RiskHazardsAndControls = forwardRef(({ riskAssessmentId, readOnly }: RiskHazardsAndControlsProps, ref) => {
  const [hazards, setHazards] = useState<any[]>([]);
  const [openItems, setOpenItems] = useState<string[]>([]);

  // Fetch hazard types
  const { data: hazardTypes } = useQuery({
    queryKey: ['hazardTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_data')
        .select('*')
        .eq('category', 'HAZARD_TYPE')
        .eq('status', 'ACTIVE')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // Fetch likelihood options
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

  // Fetch consequence options
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

  // Fetch existing hazards if we have a risk assessment ID
  useQuery({
    queryKey: ['risk-hazards', riskAssessmentId],
    queryFn: async () => {
      if (!riskAssessmentId) return [];
      const { data, error } = await supabase
        .from('risk_hazards_and_controls')
        .select(`
          *,
          hazard_type:master_data!risk_hazards_and_controls_hazard_type_id_fkey (
            id,
            label
          )
        `)
        .eq('risk_assessment_id', riskAssessmentId);
      if (error) throw error;
      setHazards(data);
      return data;
    },
    enabled: !!riskAssessmentId
  });

  const saveMutation = useMutation({
    mutationFn: async (hazardsData: any[]) => {
      if (!riskAssessmentId) return;

      // First delete existing records
      await supabase
        .from('risk_hazards_and_controls')
        .delete()
        .eq('risk_assessment_id', riskAssessmentId);

      // Then insert new records
      if (hazardsData.length > 0) {
        const { error } = await supabase
          .from('risk_hazards_and_controls')
          .insert(
            hazardsData.map(h => ({
              risk_assessment_id: riskAssessmentId,
              hazard_type_id: h.hazard_type_id,
              hazard: h.hazard,
              control: h.control,
              control_in_place: h.control_in_place,
              likelihood_id: h.likelihood_id,
              consequence_id: h.consequence_id,
              risk_score_id: h.risk_score_id
            }))
          );
        
        if (error) throw error;
      }
    }
  });

  useImperativeHandle(ref, () => ({
    saveHazards: async () => {
      if (hazards.length > 0) {
        await saveMutation.mutateAsync(hazards);
      }
    }
  }));

  const handleAdd = async () => {
    if (!hazardTypes?.length) return;

    const newHazard = {
      id: crypto.randomUUID(),
      hazard_type_id: hazardTypes[0].id,
      hazard: "",
      control: "",
      control_in_place: false,
      likelihood_id: null,
      consequence_id: null,
      risk_score_id: null,
      risk_assessment_id: riskAssessmentId
    };

    setHazards([...hazards, newHazard]);
    setOpenItems(prev => [...prev, newHazard.id]);
  };

  const handleUpdate = async (id: string, field: string, value: any) => {
    const updatedHazards = hazards.map(h => {
      if (h.id === id) {
        const updatedHazard = { ...h, [field]: value };
        
        // Update risk score if likelihood or consequence changes
        if (field === 'likelihood_id' || field === 'consequence_id') {
          updateRiskScore(updatedHazard);
        }
        
        return updatedHazard;
      }
      return h;
    });
    setHazards(updatedHazards);
  };

  const updateRiskScore = async (hazard: any) => {
    if (hazard.likelihood_id && hazard.consequence_id) {
      const { data, error } = await supabase
        .from('risk_matrix')
        .select('*')
        .eq('likelihood_id', hazard.likelihood_id)
        .eq('consequence_id', hazard.consequence_id)
        .single();
      
      if (!error && data) {
        handleUpdate(hazard.id, 'risk_score_id', data.id);
        handleUpdate(hazard.id, 'risk_score', data);
      }
    }
  };

  const handleDelete = (id: string) => {
    setHazards(hazards.filter(h => h.id !== id));
    setOpenItems(openItems.filter(item => item !== id));
  };

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  if (readOnly && !hazards.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Hazards and Controls</h2>
        {!readOnly && (
          <Button
            onClick={handleAdd}
            className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Hazard & Control
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {hazards.map((hazard) => (
          <Collapsible
            key={hazard.id}
            open={openItems.includes(hazard.id)}
            className="border rounded-lg"
          >
            <div 
              className="flex items-start justify-between p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleItem(hazard.id)}
            >
              <div className="flex-1 grid grid-cols-[auto,1fr,1fr] gap-4 items-start">
                <CollapsibleTrigger className="flex items-center pt-1">
                  {openItems.includes(hazard.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                
                <div>
                  <div className="font-medium text-sm text-gray-500">Type</div>
                  <div className="font-medium">{hazard.hazard_type?.label}</div>
                </div>

                {hazard.risk_score && (
                  <div>
                    <div className="font-medium text-sm text-gray-500">Risk Level</div>
                    <Badge
                      style={{
                        backgroundColor: hazard.risk_score.risk_color || '#gray-400',
                        color: '#FFFFFF'
                      }}
                    >
                      {hazard.risk_score.risk_label}
                    </Badge>
                  </div>
                )}
              </div>

              {!readOnly && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(hazard.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <CollapsibleContent className="p-4 pt-0 border-t">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hazard Type</Label>
                    {readOnly ? (
                      <div className="p-2 bg-gray-50 rounded border">
                        {hazard.hazard_type?.label || '-'}
                      </div>
                    ) : (
                      <Select
                        value={hazard.hazard_type_id}
                        onValueChange={(value) => handleUpdate(hazard.id, 'hazard_type_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select hazard type" />
                        </SelectTrigger>
                        <SelectContent>
                          {hazardTypes?.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Control In Place</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id={`control-in-place-${hazard.id}`}
                        checked={hazard.control_in_place}
                        onCheckedChange={(checked) => 
                          handleUpdate(hazard.id, 'control_in_place', checked)
                        }
                        disabled={readOnly}
                      />
                      <label
                        htmlFor={`control-in-place-${hazard.id}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Yes
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Hazard</Label>
                  {readOnly ? (
                    <div className="p-2 bg-gray-50 rounded border">
                      {hazard.hazard}
                    </div>
                  ) : (
                    <Textarea
                      value={hazard.hazard}
                      onChange={(e) => handleUpdate(hazard.id, 'hazard', e.target.value)}
                      placeholder="Enter hazard description"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Control</Label>
                  {readOnly ? (
                    <div className="p-2 bg-gray-50 rounded border">
                      {hazard.control}
                    </div>
                  ) : (
                    <Textarea
                      value={hazard.control}
                      onChange={(e) => handleUpdate(hazard.id, 'control', e.target.value)}
                      placeholder="Enter control measures"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Likelihood</Label>
                    {readOnly ? (
                      <div className="p-2 bg-gray-50 rounded border">
                        {likelihoodOptions?.find(l => l.id === hazard.likelihood_id)?.name || '-'}
                      </div>
                    ) : (
                      <Select
                        value={hazard.likelihood_id?.toString()}
                        onValueChange={(value) => handleUpdate(hazard.id, 'likelihood_id', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select likelihood" />
                        </SelectTrigger>
                        <SelectContent>
                          {likelihoodOptions?.map((option) => (
                            <SelectItem key={option.id} value={option.id.toString()}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Consequence</Label>
                    {readOnly ? (
                      <div className="p-2 bg-gray-50 rounded border">
                        {consequenceOptions?.find(c => c.id === hazard.consequence_id)?.name || '-'}
                      </div>
                    ) : (
                      <Select
                        value={hazard.consequence_id?.toString()}
                        onValueChange={(value) => handleUpdate(hazard.id, 'consequence_id', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select consequence" />
                        </SelectTrigger>
                        <SelectContent>
                          {consequenceOptions?.map((option) => (
                            <SelectItem key={option.id} value={option.id.toString()}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}

        {hazards.length === 0 && !readOnly && (
          <div className="text-center py-6 text-gray-500">
            No hazards and controls added yet.
          </div>
        )}
      </div>
    </div>
  );
});
