import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HazardData {
  id: string;
  risk_assessment_id: string;
  hazard_control_id?: string;
  hazard_type_id: string;
  hazard: string;
  control: string;
  control_in_place: boolean;
  likelihood_id: number | null;
  consequence_id: number | null;
  risk_score_id: number | null;
  risk_score_int: number | null;
  risk_level_text: string | null;
  likelihood_text: string | null;
  consequence_text: string | null;
  source: 'Manual' | 'Product' | 'Custom';
}

interface RiskHazardsAndControlsProps {
  riskAssessmentId: string | null;
  readOnly?: boolean;
}

export interface RiskHazardsAndControlsRef {
  handleAdd: () => void;
  saveHazards: (riskAssessmentId: string) => Promise<void>;
  populateHazards: (hazards: any[]) => void;
  onSaveSuccess?: () => Promise<void>;
}

export const RiskHazardsAndControls = forwardRef<RiskHazardsAndControlsRef, RiskHazardsAndControlsProps>(
  ({ riskAssessmentId, readOnly }, ref) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hazards, setHazards] = useState<any[]>([]);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hazardToDelete, setHazardToDelete] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string[] }>({});

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

  const { data: hazardsData, refetch: refetchHazards } = useQuery({
    queryKey: ['risk-hazards', riskAssessmentId],
    queryFn: async () => {
      if (!riskAssessmentId) return [];
      
      console.log('Fetching hazards for risk assessment:', riskAssessmentId);
      
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
        .eq('risk_assessment_id', riskAssessmentId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;

      return Promise.all((hazardsData || []).map(async (hazard) => {
        if (hazard.likelihood_id && hazard.consequence_id) {
          const { data: riskScore } = await supabase
            .from('risk_matrix')
            .select('*')
            .eq('likelihood_id', hazard.likelihood_id)
            .eq('consequence_id', hazard.consequence_id)
            .single();
          
          return { ...hazard, risk_score: riskScore };
        }
        return hazard;
      }));
    },
    enabled: !!riskAssessmentId
  });

  useEffect(() => {
    if (hazardsData) {
      console.log('Setting hazards state:', hazardsData.length, 'records');
      setHazards(hazardsData);
    }
  }, [hazardsData]);

  const validateHazard = (hazard: HazardData): string[] => {
    const errors: string[] = [];
    
    if (!hazard.hazard_type_id) {
      errors.push('Hazard Type is required');
    }
    if (!hazard.hazard || hazard.hazard.trim() === '') {
      errors.push('Hazard Description is required');
    }
    if (!hazard.control || hazard.control.trim() === '') {
      errors.push('Control Description is required');
    }
    if (!hazard.likelihood_id) {
      errors.push('Likelihood is required');
    }
    if (!hazard.consequence_id) {
      errors.push('Consequence is required');
    }

    return errors;
  };

  const updateOverallRiskAssessment = async (hazardsData: any[]) => {
    if (!riskAssessmentId) return;

    const highestRiskHazard = hazardsData.reduce((prev, current) => {
      const prevScore = prev.risk_score_int || 0;
      const currentScore = current.risk_score_int || 0;
      return currentScore > prevScore ? current : prev;
    }, hazardsData[0]);

    if (highestRiskHazard) {
      const { data, error } = await supabase
        .from('risk_assessments')
        .update({
          overall_likelihood_id: highestRiskHazard.likelihood_id,
          overall_consequence_id: highestRiskHazard.consequence_id,
          overall_risk_score_id: highestRiskHazard.risk_score_id,
          overall_risk_score_int: highestRiskHazard.risk_score_int,
          overall_likelihood_text: highestRiskHazard.likelihood_text,
          overall_consequence_text: highestRiskHazard.consequence_text,
          overall_risk_level_text: highestRiskHazard.risk_level_text
        })
        .eq('id', riskAssessmentId);

      if (error) {
        console.error('Error updating overall risk assessment:', error);
        throw error;
      }

      queryClient.invalidateQueries({
        queryKey: ['risk-assessments']
      });
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (hazardsData: any[]) => {
      if (!riskAssessmentId) return;

      const allErrors: { [key: string]: string[] } = {};
      let hasErrors = false;

      hazardsData.forEach(hazard => {
        const hazardErrors = validateHazard(hazard);
        if (hazardErrors.length > 0) {
          allErrors[hazard.id] = hazardErrors;
          hasErrors = true;
        }
      });

      if (hasErrors) {
        setValidationErrors(allErrors);
        throw new Error('Please fill in all required fields for each hazard');
      }

      const copiedHazards = hazardsData.filter(h => h.hazard_control_id);
      const manualHazards = hazardsData.filter(h => !h.hazard_control_id);

      if (manualHazards.length > 0) {
        const { error: deleteError } = await supabase
          .from('risk_hazards_and_controls')
          .delete()
          .eq('risk_assessment_id', riskAssessmentId)
          .is('hazard_control_id', null);

        if (deleteError) throw deleteError;
      }

      if (manualHazards.length > 0) {
        const { error: insertError } = await supabase
          .from('risk_hazards_and_controls')
          .insert(manualHazards.map(h => ({
            risk_assessment_id: riskAssessmentId,
            hazard_type_id: h.hazard_type_id,
            hazard: h.hazard,
            control: h.control,
            control_in_place: h.control_in_place,
            likelihood_id: h.likelihood_id,
            consequence_id: h.consequence_id,
            risk_score_id: h.risk_score_id,
            risk_score_int: h.risk_score_int,
            likelihood_text: h.likelihood_text,
            consequence_text: h.consequence_text,
            risk_level_text: h.risk_level_text,
            source: h.source || 'Custom'
          })));

        if (insertError) throw insertError;
      }

      for (const hazard of copiedHazards) {
        const { error: updateError } = await supabase
          .from('risk_hazards_and_controls')
          .update({
            hazard_type_id: hazard.hazard_type_id,
            hazard: hazard.hazard,
            control: hazard.control,
            control_in_place: hazard.control_in_place,
            likelihood_id: hazard.likelihood_id,
            consequence_id: hazard.consequence_id,
            risk_score_id: hazard.risk_score_id,
            risk_score_int: hazard.risk_score_int,
            likelihood_text: hazard.likelihood_text,
            consequence_text: hazard.consequence_text,
            risk_level_text: hazard.risk_level_text
          })
          .eq('id', hazard.id);

        if (updateError) throw updateError;
      }

      await updateOverallRiskAssessment([...manualHazards, ...copiedHazards]);
    },
    onSuccess: async () => {
      console.log('Save mutation successful, invalidating queries');
      
      await queryClient.invalidateQueries({
        queryKey: ['risk-hazards', riskAssessmentId]
      });
      
      console.log('Queries invalidated, calling onSaveSuccess');
      if (ref && 'current' in ref && ref.current?.onSaveSuccess) {
        await ref.current.onSaveSuccess();
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
    },
    onSaveSuccess: undefined
  }));

  const deleteMutation = useMutation({
    mutationFn: async (hazardId: string) => {
      const { error } = await supabase
        .from('risk_hazards_and_controls')
        .delete()
        .eq('id', hazardId);

      if (error) throw error;
    },
    onSuccess: async (_, hazardId) => {
      setHazards(current => current.filter(h => h.id !== hazardId));
      await refetchHazards();
      
      toast({
        title: "Success",
        description: "Hazard deleted successfully",
      });
      setDeleteDialogOpen(false);
      setHazardToDelete(null);
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete hazard",
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
      setHazardToDelete(null);
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
      source: "Custom" as const
    };

    setHazards([...hazards, newHazard]);
    setOpenItems([newHazard.id]);
  };

  const handleUpdate = async (id: string, field: string, value: any) => {
    const updatedHazards = hazards.map(h => {
      if (h.id === id) {
        const updatedHazard = { 
          ...h, 
          [field]: value,
          ...(field === 'likelihood_id' ? {
            likelihood_text: likelihoodOptions?.find(l => l.id === value)?.name
          } : {}),
          ...(field === 'consequence_id' ? {
            consequence_text: consequenceOptions?.find(c => c.id === value)?.name
          } : {})
        };
        
        if (validationErrors[id]) {
          const newErrors = { ...validationErrors };
          newErrors[id] = newErrors[id].filter(error => !error.toLowerCase().includes(field.toLowerCase()));
          if (newErrors[id].length === 0) {
            delete newErrors[id];
          }
          setValidationErrors(newErrors);
        }
        
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
        const updatedHazards = hazards.map(h => {
          if (h.id === hazard.id) {
            return {
              ...h,
              likelihood_id: hazard.likelihood_id,
              likelihood_text: likelihoodOptions?.find(l => l.id === hazard.likelihood_id)?.name,
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

  const handleDeleteClick = (id: string) => {
    setHazardToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (hazardToDelete) {
      await deleteMutation.mutateAsync(hazardToDelete);
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
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[100px] sm:w-[150px] text-left font-semibold whitespace-nowrap overflow-hidden text-ellipsis">Type</TableHead>
            <TableHead 
              className="w-[125px] sm:w-[175px] text-left font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
              title="Hazard Description"
            >
              Hazard Desc.
            </TableHead>
            <TableHead 
              className="w-[125px] sm:w-[175px] text-left font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
              title="Control Description"
            >
              Control Desc.
            </TableHead>
            <TableHead className="w-[120px] sm:w-[150px] text-center font-semibold">Risk Level</TableHead>
            {!readOnly && (
              <TableHead className="w-[60px] sm:w-[80px] text-center font-semibold">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {hazards.map((hazard) => (
            <React.Fragment key={hazard.id}>
              <TableRow 
                className="hover:bg-gray-50 cursor-pointer" 
                onClick={() => toggleItem(hazard.id)}
              >
                <TableCell className="w-[50px] text-center">
                  {openItems.includes(hazard.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </TableCell>
                <TableCell className="w-[100px] sm:w-[150px]">
                  <div className="truncate" title={hazard.hazard_type?.label}>
                    {hazard.hazard_type?.label || '-'}
                  </div>
                </TableCell>
                <TableCell className="w-[125px] sm:w-[175px]">
                  <div 
                    className="max-h-[2.5rem] overflow-hidden text-ellipsis break-words"
                    title={hazard.hazard}
                  >
                    {hazard.hazard || '-'}
                  </div>
                </TableCell>
                <TableCell className="w-[125px] sm:w-[175px]">
                  <div 
                    className="max-h-[2.5rem] overflow-hidden text-ellipsis break-words"
                    title={hazard.control}
                  >
                    {hazard.control || '-'}
                  </div>
                </TableCell>
                <TableCell className="w-[120px] sm:w-[150px] text-center">
                  {hazard.risk_score && (
                    <Badge
                      style={{
                        backgroundColor: hazard.risk_score.risk_color || '#gray-400',
                        color: '#FFFFFF'
                      }}
                      className="px-2 py-1 text-sm font-semibold rounded"
                    >
                      {hazard.risk_score.risk_label}
                    </Badge>
                  )}
                </TableCell>
                {!readOnly && (
                  <TableCell className="w-[60px] sm:w-[80px] text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(hazard.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>

              {openItems.includes(hazard.id) && (
                <TableRow className="bg-gray-50 border-t">
                  <TableCell colSpan={readOnly ? 5 : 6} className="p-4">
                    <div className="grid grid-cols-12 gap-6">
                      {validationErrors[hazard.id] && validationErrors[hazard.id].length > 0 && (
                        <div className="col-span-12 bg-red-50 border border-red-200 rounded p-2">
                          <ul className="text-red-600 text-sm list-disc pl-4">
                            {validationErrors[hazard.id].map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="col-span-2 space-y-2">
                        <Label>Hazard Type</Label>
                        {readOnly ? (
                          <div className="p-2 bg-white rounded border">
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

                      <div className="col-span-3 space-y-2">
                        <Label>Hazard Description</Label>
                        {readOnly ? (
                          <div className="p-2 bg-white rounded border min-h-[80px]">
                            {hazard.hazard}
                          </div>
                        ) : (
                          <Textarea
                            value={hazard.hazard}
                            onChange={(e) => handleUpdate(hazard.id, 'hazard', e.target.value)}
                            placeholder="Enter hazard description"
                            className="min-h-[80px]"
                          />
                        )}
                      </div>

                      <div className="col-span-3 space-y-2">
                        <Label>Control Measures</Label>
                        {readOnly ? (
                          <div className="p-2 bg-white rounded border min-h-[80px]">
                            {hazard.control}
                          </div>
                        ) : (
                          <Textarea
                            value={hazard.control}
                            onChange={(e) => handleUpdate(hazard.id, 'control', e.target.value)}
                            placeholder="Enter control measures"
                            className="min-h-[80px]"
                          />
                        )}
                      </div>

                      <div className="col-span-1 space-y-2">
                        <Label>Control In Place</Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`control-in-place-${hazard.id}`}
                            checked={hazard.control_in_place}
                            onCheckedChange={(checked) => handleUpdate(hazard.id, 'control_in_place', checked)}
                            disabled={readOnly}
                          />
                          <Label htmlFor={`control-in-place-${hazard.id}`} className="text-sm">
                            Yes
                          </Label>
                        </div>
                      </div>

                      <div className="col-span-1 space-y-2">
                        <Label>Likelihood</Label>
                        {readOnly ? (
                          <div className="p-2 bg-white rounded border">
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

                      <div className="col-span-1 space-y-2">
                        <Label>Consequence</Label>
                        {readOnly ? (
                          <div className="p-2 bg-white rounded border">
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

                      <div className="col-span-1 space-y-2">
                        <Label>Risk Level</Label>
                        <div className="h-[38px] flex items-center">
                          {hazard.risk_score && (
                            <Badge
                              style={{
                                backgroundColor: hazard.risk_score.risk_color || '#gray-400',
                                color: '#FFFFFF'
                              }}
                              className="px-3 py-1"
                            >
                              {hazard.risk_score.risk_label}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hazard & Control</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hazard and control? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {hazards.length === 0 && !readOnly && (
        <div className="text-center py-6 text-gray-500">
          No hazards and controls added yet.
        </div>
      )}
    </div>
  );
});

RiskHazardsAndControls.displayName = "RiskHazardsAndControls";
