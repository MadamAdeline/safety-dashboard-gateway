
import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface RiskHazardsAndControlsProps {
  riskAssessmentId: string | null;
  readOnly?: boolean;
  onSaveSuccess?: () => Promise<void>;
}

export interface RiskHazardsAndControlsRef {
  handleAdd: () => void;
  saveHazards: (riskAssessmentId: string) => Promise<void>;
  populateHazards: (hazards: any[]) => void;
}

export const RiskHazardsAndControls = forwardRef<RiskHazardsAndControlsRef, RiskHazardsAndControlsProps>(
  ({ riskAssessmentId, readOnly, onSaveSuccess }, ref) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hazards, setHazards] = useState<any[]>([]);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hazardToDelete, setHazardToDelete] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string[] }>({});

  const {
    data: hazardTypes
  } = useQuery({
    queryKey: ['hazard-types'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('master_data').select('*').eq('category', 'HAZARD_TYPE').eq('status', 'ACTIVE').order('sort_order', {
        ascending: true
      });
      if (error) throw error;
      return data;
    }
  });

  const {
    data: likelihoodOptions
  } = useQuery({
    queryKey: ['likelihood-options'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('likelihood').select('*').order('score', {
        ascending: true
      });
      if (error) throw error;
      return data;
    }
  });

  const {
    data: consequenceOptions
  } = useQuery({
    queryKey: ['consequence-options'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('consequence').select('*').order('score', {
        ascending: true
      });
      if (error) throw error;
      return data;
    }
  });

  const {
    data: riskMatrix,
    refetch: refetchRiskMatrix
  } = useQuery({
    queryKey: ['risk-matrix'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('risk_matrix').select('*');
      if (error) throw error;
      return data;
    }
  });

  const {
    data: riskHazards,
    refetch: refetchRiskHazards
  } = useQuery({
    queryKey: ['risk-hazards', riskAssessmentId],
    queryFn: async () => {
      if (!riskAssessmentId) return null;
      
      const { data, error } = await supabase
        .from('risk_assessment_hazards')
        .select(`
          id,
          risk_assessment_id,
          hazard_type_id,
          hazard,
          control,
          source,
          likelihood_id,
          consequence_id,
          risk_score_id,
          control_in_place
        `)
        .eq('risk_assessment_id', riskAssessmentId);

      if (error) throw error;
      return data;
    },
    enabled: !!riskAssessmentId
  });

  useEffect(() => {
    if (riskHazards) {
      setHazards(riskHazards);
      setOpenItems(riskHazards.map(h => h.id));
    }
  }, [riskHazards]);

  const handleAdd = () => {
    const newHazard = {
      id: uuidv4(),
      hazard_type_id: null,
      hazard: "",
      control: "",
      source: "",
      likelihood_id: null,
      consequence_id: null,
      risk_score_id: null,
      control_in_place: false,
      isNew: true
    };
    setHazards(prev => [...prev, newHazard]);
    setOpenItems(prev => [...prev, newHazard.id]);
  };

  const handleRemove = (id: string) => {
    setHazardToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmRemove = async () => {
    if (!hazardToDelete) return;

    setDeleteDialogOpen(false);

    // Optimistically update the UI
    setHazards(prev => prev.filter(h => h.id !== hazardToDelete));
    setOpenItems(prev => prev.filter(item => item !== hazardToDelete));

    try {
      // If the hazard was already saved to the database, delete it
      const existingHazard = riskHazards?.find(h => h.id === hazardToDelete);
      if (existingHazard) {
        const { error } = await supabase
          .from('risk_assessment_hazards')
          .delete()
          .eq('id', existingHazard.id);

        if (error) {
          console.error("Error deleting hazard:", error);
          toast({
            title: "Error",
            description: "Failed to delete hazard",
            variant: "destructive"
          });
          // Revert the UI update
          setHazards(prev => [...prev, existingHazard]);
          setOpenItems(prev => [...prev, hazardToDelete]);
          return;
        }
      }

      toast({
        title: "Success",
        description: "Hazard removed successfully"
      });
    } catch (error) {
      console.error("Error deleting hazard:", error);
      toast({
        title: "Error",
        description: "Failed to delete hazard",
        variant: "destructive"
      });
      // Revert the UI update
      // If you have access to the original data, you can revert it here
      // setHazards(prev => [...prev, originalHazard]);
      // setOpenItems(prev => [...prev, hazardToDelete]);
    } finally {
      setHazardToDelete(null);
    }
  };

  const handleFieldChange = (id: string, field: string, value: any) => {
    setHazards(prev =>
      prev.map(hazard =>
        hazard.id === id ? { ...hazard, [field]: value } : hazard
      )
    );
  };

  const handleRiskScoreChange = useCallback(async (id: string, likelihoodId: number | null, consequenceId: number | null) => {
    if (!likelihoodId || !consequenceId) {
      setHazards(prev => prev.map(hazard => hazard.id === id ? { ...hazard, likelihood_id: likelihoodId, consequence_id: consequenceId, risk_score_id: null } : hazard));
      return;
    }

    const { data, error } = await supabase
      .from('risk_matrix')
      .select('*')
      .eq('likelihood_id', likelihoodId)
      .eq('consequence_id', consequenceId)
      .single();

    if (error) {
      console.error('Error fetching risk score:', error);
      return;
    }

    setHazards(prev => prev.map(hazard => hazard.id === id ? { ...hazard, likelihood_id: likelihoodId, consequence_id: consequenceId, risk_score_id: data.id } : hazard));
  }, []);

  const updateOverallRiskAssessment = async (hazards: any[]) => {
    if (!riskAssessmentId) return;

    let highestRiskScore = null;

    for (const hazard of hazards) {
      if (hazard.risk_score_id) {
        if (!highestRiskScore || hazard.risk_score_id > highestRiskScore) {
          highestRiskScore = hazard.risk_score_id;
        }
      }
    }

    const { error } = await supabase
      .from('risk_assessments')
      .update({ overall_risk_score_id: highestRiskScore })
      .eq('id', riskAssessmentId);

    if (error) {
      console.error('Error updating overall risk assessment:', error);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (hazardsData: any[]) => {
      if (!riskAssessmentId) return;

      console.log('Starting save mutation with hazards:', hazardsData);

      const allErrors: { [key: string]: string[] } = {};
      let hasErrors = false;

      const manualHazards = [];
      const copiedHazards = [];

      for (const hazard of hazardsData) {
        const errors: string[] = [];
        if (!hazard.hazard_type_id) {
          errors.push("Hazard type is required");
          hasErrors = true;
        }
        if (!hazard.hazard) {
          errors.push("Hazard description is required");
          hasErrors = true;
        }
        if (!hazard.control) {
          errors.push("Control measure is required");
          hasErrors = true;
        }
        if (!hazard.likelihood_id) {
          errors.push("Likelihood is required");
          hasErrors = true;
        }
        if (!hazard.consequence_id) {
          errors.push("Consequence is required");
          hasErrors = true;
        }

        allErrors[hazard.id] = errors;

        if (!hazard.isNew) {
          manualHazards.push(hazard);
        } else {
          copiedHazards.push(hazard);
        }
      }

      setValidationErrors(allErrors);

      if (hasErrors) {
        throw new Error("Please correct the validation errors before saving.");
      }

      // First, update existing hazards
      const updates = manualHazards.map(async (hazard) => {
        const { id, ...updates } = hazard;
        const { data, error } = await supabase
          .from('risk_assessment_hazards')
          .update(updates)
          .eq('id', id)
          .select();

        if (error) {
          console.error("Error updating hazard:", error);
          throw new Error(`Failed to update hazard: ${error.message}`);
        }

        return data;
      });

      // Then, insert new hazards
      const inserts = copiedHazards.map(async (hazard) => {
        const { id, isNew, ...insert } = hazard;
        const { data, error } = await supabase
          .from('risk_assessment_hazards')
          .insert([{ ...insert, risk_assessment_id: riskAssessmentId }])
          .select();

        if (error) {
          console.error("Error inserting hazard:", error);
          throw new Error(`Failed to insert hazard: ${error.message}`);
        }

        return data;
      });

      await Promise.all([...updates, ...inserts]);

      // Update overall risk assessment with highest risk score
      await updateOverallRiskAssessment([...manualHazards, ...copiedHazards]);
    },
    onSuccess: async () => {
      console.log('Save mutation successful, invalidating queries');
      
      await queryClient.invalidateQueries({
        queryKey: ['risk-hazards', riskAssessmentId]
      });
      
      console.log('Queries invalidated, calling onSaveSuccess');
      if (onSaveSuccess) {
        await onSaveSuccess();
      }
      
      toast({
        title: "Success",
        description: "Hazards and controls saved successfully"
      });
    },
    onError: (error: Error) => {
      console.error('Save mutation error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
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

  return (
    <div className="space-y-4">
      {hazards.map((hazard, index) => (
        <Accordion type="multiple" key={hazard.id} defaultValue={openItems} className="w-full">
          <AccordionItem value={hazard.id}>
            <AccordionTrigger>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <GripVertical className="mr-2 h-4 w-4 text-gray-500 cursor-grab active:cursor-grabbing" />
                  <span>Hazard {index + 1}: {hazard.hazard || "New Hazard"}</span>
                </div>
                {!readOnly && (
                  <Button variant="ghost" size="icon" onClick={(e) => {
                    e.stopPropagation(); // Prevent accordion from opening/closing
                    handleRemove(hazard.id);
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Hazard Type</Label>
                  <Select 
                    value={hazard.hazard_type_id || ""} 
                    onValueChange={(value) => handleFieldChange(hazard.id, "hazard_type_id", value)}
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select hazard type" />
                    </SelectTrigger>
                    <SelectContent>
                      {hazardTypes?.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors[hazard.id]?.includes("Hazard type is required") && (
                    <p className="text-red-500 text-sm">Hazard type is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Source</Label>
                  <Input 
                    type="text" 
                    value={hazard.source || ""} 
                    onChange={(e) => handleFieldChange(hazard.id, "source", e.target.value)}
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Hazard Description</Label>
                  <Textarea
                    value={hazard.hazard || ""}
                    onChange={(e) => handleFieldChange(hazard.id, "hazard", e.target.value)}
                    disabled={readOnly}
                  />
                  {validationErrors[hazard.id]?.includes("Hazard description is required") && (
                    <p className="text-red-500 text-sm">Hazard description is required</p>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Control Measure</Label>
                  <Textarea
                    value={hazard.control || ""}
                    onChange={(e) => handleFieldChange(hazard.id, "control", e.target.value)}
                    disabled={readOnly}
                  />
                  {validationErrors[hazard.id]?.includes("Control measure is required") && (
                    <p className="text-red-500 text-sm">Control measure is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Likelihood</Label>
                  <Select 
                    value={hazard.likelihood_id?.toString() || ""} 
                    onValueChange={(value) => {
                      handleFieldChange(hazard.id, "likelihood_id", parseInt(value));
                      handleRiskScoreChange(hazard.id, parseInt(value), hazard.consequence_id);
                    }}
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select likelihood" />
                    </SelectTrigger>
                    <SelectContent>
                      {likelihoodOptions?.map(option => (
                        <SelectItem key={option.id} value={option.id.toString()}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors[hazard.id]?.includes("Likelihood is required") && (
                    <p className="text-red-500 text-sm">Likelihood is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Consequence</Label>
                  <Select 
                    value={hazard.consequence_id?.toString() || ""} 
                    onValueChange={(value) => {
                      handleFieldChange(hazard.id, "consequence_id", parseInt(value));
                      handleRiskScoreChange(hazard.id, hazard.likelihood_id, parseInt(value));
                    }}
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select consequence" />
                    </SelectTrigger>
                    <SelectContent>
                      {consequenceOptions?.map(option => (
                        <SelectItem key={option.id} value={option.id.toString()}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors[hazard.id]?.includes("Consequence is required") && (
                    <p className="text-red-500 text-sm">Consequence is required</p>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to remove this hazard?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setHazardToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

RiskHazardsAndControls.displayName = "RiskHazardsAndControls";
