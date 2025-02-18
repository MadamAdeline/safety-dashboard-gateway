
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface RiskHazardsAndControlsProps {
  riskAssessmentId: string | null;
  readOnly?: boolean;
}

export interface RiskHazardsAndControlsRef {
  handleAdd: () => void;
  saveHazards: (riskAssessmentId: string) => Promise<void>;
  populateHazards: (hazards: any[]) => void;
}

export const RiskHazardsAndControls = forwardRef<RiskHazardsAndControlsRef, RiskHazardsAndControlsProps>(({ riskAssessmentId, readOnly }, ref) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hazards, setHazards] = useState<any[]>([]);
  const [openItems, setOpenItems] = useState<string[]>([]);

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

  const { data: siteRegister } = useQuery({
    queryKey: ['site-register', riskAssessmentId],
    queryFn: async () => {
      if (!riskAssessmentId) return null;
      
      const { data: riskAssessment } = await supabase
        .from('risk_assessments')
        .select('site_register_record_id')
        .eq('id', riskAssessmentId)
        .single();

      if (!riskAssessment?.site_register_record_id) return null;

      const { data, error } = await supabase
        .from('site_registers')
        .select(`
          *,
          product:products (
            id,
            product_name
          )
        `)
        .eq('id', riskAssessment.site_register_record_id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!riskAssessmentId
  });

  useQuery({
    queryKey: ['risk-hazards', riskAssessmentId],
    queryFn: async () => {
      if (!riskAssessmentId) return [];
      
      const { data: hazardsData, error } = await supabase
        .from('risk_hazards_and_controls')
        .select(`
          *,
          hazard_type:master_data!risk_hazards_and_controls_hazard_type_id_fkey (
            id,
            label
          ),
          product_hazard:hazards_and_controls!risk_hazards_and_controls_hazard_control_id_fkey (
            hazard_control_id,
            hazard,
            control,
            hazard_type
          )
        `)
        .eq('risk_assessment_id', riskAssessmentId);
      
      if (error) throw error;

      const hazardsWithRiskScores = await Promise.all(
        hazardsData.map(async (hazard) => {
          if (hazard.likelihood_id && hazard.consequence_id) {
            const { data: riskScore } = await supabase
              .from('risk_matrix')
              .select('*')
              .eq('likelihood_id', hazard.likelihood_id)
              .eq('consequence_id', hazard.consequence_id)
              .single();

            return {
              ...hazard,
              risk_score: riskScore
            };
          }
          return hazard;
        })
      );

      console.log('Loaded hazards with risk scores:', hazardsWithRiskScores);
      setHazards(hazardsWithRiskScores);
      return hazardsWithRiskScores;
    },
    enabled: !!riskAssessmentId
  });

  const autoGenerateMutation = useMutation({
    mutationFn: async () => {
      if (!riskAssessmentId || !siteRegister?.product?.id) return;

      const { data: existingHazards } = await supabase
        .from('risk_hazards_and_controls')
        .select('hazard_control_id')
        .eq('risk_assessment_id', riskAssessmentId);

      const existingHazardIds = existingHazards?.map(h => h.hazard_control_id) || [];

      const { data: productHazards, error: hazardsError } = await supabase
        .from('hazards_and_controls')
        .select(`
          hazard_control_id,
          hazard_type,
          hazard,
          control,
          source
        `)
        .eq('product_id', siteRegister.product.id);

      if (hazardsError) throw hazardsError;

      const newHazards = productHazards?.filter(
        ph => !existingHazardIds.includes(ph.hazard_control_id)
      );

      if (newHazards && newHazards.length > 0) {
        const hazardsToInsert = newHazards.map(ph => ({
          risk_assessment_id: riskAssessmentId,
          hazard_type_id: ph.hazard_type,
          hazard: ph.hazard,
          control: ph.control,
          source: "Product",
          hazard_control_id: ph.hazard_control_id,
          control_in_place: false,
          likelihood_id: null,
          consequence_id: null,
          risk_score_id: null
        }));

        const { error: insertError } = await supabase
          .from('risk_hazards_and_controls')
          .insert(hazardsToInsert);

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }

        queryClient.invalidateQueries({ queryKey: ['risk-hazards', riskAssessmentId] });
        return hazardsToInsert;
      }

      return [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (hazardsData: any[]) => {
      if (!riskAssessmentId) return;

      await supabase
        .from('risk_hazards_and_controls')
        .delete()
        .eq('risk_assessment_id', riskAssessmentId);

      if (hazardsData.length > 0) {
        const dataToSave = hazardsData.map(h => {
          console.log('Saving hazard data:', h);
          return {
            risk_assessment_id: riskAssessmentId,
            hazard_type_id: h.hazard_type_id,
            hazard: h.hazard,
            control: h.control,
            control_in_place: h.control_in_place,
            likelihood_id: h.likelihood_id,
            consequence_id: h.consequence_id,
            risk_score_id: h.risk_score?.id,
            risk_score_int: h.risk_score?.risk_score,
            risk_level_text: h.risk_score?.risk_label,
            likelihood_text: likelihoodOptions?.find(l => l.id === h.likelihood_id)?.name,
            consequence_text: h.consequence_text,
            hazard_control_id: h.hazard_control_id
          };
        });

        console.log('Data being saved to database:', dataToSave);
        const { error } = await supabase
          .from('risk_hazards_and_controls')
          .insert(dataToSave);
        
        if (error) {
          console.error('Error saving hazards:', error);
          throw error;
        }
      }
    }
  });

  useImperativeHandle(ref, () => ({
    handleAdd,
    saveHazards: async (riskAssessmentId: string) => {
      await saveMutation.mutateAsync(hazards);
    },
    populateHazards: (newHazards: any[]) => {
      setHazards(newHazards);
      setOpenItems(newHazards.map(h => h.id));
    }
  }));

  const deleteMutation = useMutation({
    mutationFn: async (hazardId: string) => {
      if (!riskAssessmentId) return;

      const { error } = await supabase
        .from('risk_hazards_and_controls')
        .delete()
        .eq('id', hazardId);

      if (error) {
        console.error('Error deleting hazard:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-hazards', riskAssessmentId] });
      toast({
        title: "Success",
        description: "Hazard and control deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to delete hazard and control",
        variant: "destructive",
      });
    }
  });

  const handleAdd = () => {
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
      risk_assessment_id: riskAssessmentId,
      source: "Product"
    };

    setHazards([...hazards, newHazard]);
    setOpenItems([newHazard.id]);
  };

  const handleUpdate = async (id: string, field: string, value: any) => {
    console.log('Updating field:', field, 'with value:', value);
    
    const updatedHazards = hazards.map(h => {
      if (h.id === id) {
        const updatedHazard = { 
          ...h, 
          [field]: value,
          ...(field === 'consequence_id' ? {
            consequence_text: consequenceOptions?.find(c => c.id === value)?.name
          } : {})
        };
        
        if (field === 'likelihood_id' || field === 'consequence_id') {
          console.log('Triggering risk score update for:', updatedHazard);
          updateRiskScore(updatedHazard);
        }
        
        return updatedHazard;
      }
      return h;
    });
    setHazards(updatedHazards);
  };

  const updateRiskScore = async (hazard: any) => {
    console.log('Updating risk score for hazard:', {
      likelihood_id: hazard.likelihood_id,
      consequence_id: hazard.consequence_id
    });
    
    if (hazard.likelihood_id && hazard.consequence_id) {
      const { data, error } = await supabase
        .from('risk_matrix')
        .select('*')
        .eq('likelihood_id', hazard.likelihood_id)
        .eq('consequence_id', hazard.consequence_id)
        .single();
      
      if (!error && data) {
        console.log('Retrieved risk score:', data);
        
        const updatedHazards = hazards.map(h => {
          if (h.id === hazard.id) {
            return {
              ...h,
              consequence_id: hazard.consequence_id,
              consequence_text: consequenceOptions?.find(c => c.id === hazard.consequence_id)?.name,
              risk_score: data,
              risk_score_id: data.id,
              risk_score_int: data.risk_score,
              risk_level_text: data.risk_label
            };
          }
          return h;
        });
        
        setHazards(updatedHazards);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this hazard and control?')) {
      await deleteMutation.mutate(id);
      setHazards(hazards.filter(h => h.id !== id));
      setOpenItems(openItems.filter(item => item !== id));
    }
  };

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? [] : [id]
    );
  };

  if (readOnly && !hazards.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="w-[200px]">Type</TableHead>
            <TableHead className="w-[350px]">Hazard</TableHead>
            <TableHead className="w-[350px]">Control</TableHead>
            <TableHead className="w-[120px] text-right pr-8">Risk Level</TableHead>
            {!readOnly && <TableHead className="w-[50px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {hazards.map((hazard) => (
            <Collapsible key={hazard.id} open={openItems.includes(hazard.id)}>
              <TableRow 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => toggleItem(hazard.id)}
              >
                <TableCell className="py-4">
                  <CollapsibleTrigger className="flex items-center">
                    {openItems.includes(hazard.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                </TableCell>
                <TableCell className="font-medium">{hazard.hazard_type?.label || '-'}</TableCell>
                <TableCell>
                  <div className="truncate max-w-[350px]">{hazard.hazard || '-'}</div>
                </TableCell>
                <TableCell>
                  <div className="truncate max-w-[350px]">{hazard.control || '-'}</div>
                </TableCell>
                <TableCell className="text-right pr-8">
                  {hazard.risk_score && (
                    <Badge
                      style={{
                        backgroundColor: hazard.risk_score.risk_color || '#gray-400',
                        color: '#FFFFFF'
                      }}
                    >
                      {hazard.risk_score.risk_label}
                    </Badge>
                  )}
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(hazard.id);
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
              {openItems.includes(hazard.id) && (
                <TableRow>
                  <TableCell colSpan={6} className="p-6 border-t">
                    <CollapsibleContent>
                      <div className="grid grid-cols-4 gap-6">
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
                          <Label>Hazard</Label>
                          {readOnly ? (
                            <div className="p-2 bg-gray-50 rounded border min-h-[80px] overflow-y-auto">
                              {hazard.hazard}
                            </div>
                          ) : (
                            <Textarea
                              value={hazard.hazard}
                              onChange={(e) => handleUpdate(hazard.id, 'hazard', e.target.value)}
                              placeholder="Enter hazard description"
                              className="min-h-[80px] resize-none"
                            />
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Control</Label>
                          {readOnly ? (
                            <div className="p-2 bg-gray-50 rounded border min-h-[80px] overflow-y-auto">
                              {hazard.control}
                            </div>
                          ) : (
                            <Textarea
                              value={hazard.control}
                              onChange={(e) => handleUpdate(hazard.id, 'control', e.target.value)}
                              placeholder="Enter control measures"
                              className="min-h-[80px] resize-none"
                            />
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

                        <div className="space-y-2">
                          <Label>Risk Level</Label>
                          <div className="h-[38px] flex items-center">
                            {hazard.risk_score && (
                              <Badge
                                style={{
                                  backgroundColor: hazard.risk_score.risk_color || '#gray-400',
                                  color: '#FFFFFF'
                                }}
                              >
                                {hazard.risk_score.risk_label}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </TableCell>
                </TableRow>
              )}
            </Collapsible>
          ))}
        </TableBody>
      </Table>

      {hazards.length === 0 && !readOnly && (
        <div className="text-center py-6 text-gray-500">
          No hazards and controls added yet.
        </div>
      )}
    </div>
  );
});

RiskHazardsAndControls.displayName = "RiskHazardsAndControls";
