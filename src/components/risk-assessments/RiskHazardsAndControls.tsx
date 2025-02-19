
import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  source: 'Manual' | 'Product';
}

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hazardToDelete, setHazardToDelete] = useState<string | null>(null);
  const [processingDialogOpen, setProcessingDialogOpen] = useState(false);
  const [isGenerationComplete, setIsGenerationComplete] = useState(false);
  const [hasNewHazards, setHasNewHazards] = useState(false);

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

      console.log('Fetched hazards data:', hazardsData);

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

  useEffect(() => {
    if (!riskAssessmentId) return;

    console.log('Setting up realtime subscription for risk assessment:', riskAssessmentId);
    
    let channel = supabase
      .channel('risk_hazards_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'risk_hazards_and_controls',
          filter: `risk_assessment_id=eq.${riskAssessmentId}`
        },
        async (payload) => {
          console.log("New hazard added:", payload);
          await refetchHazards();
          setHasNewHazards(true);
          setIsGenerationComplete(true);
          setProcessingDialogOpen(true);
        }
      )
      .subscribe();

    // Handle subscription errors
    channel.onError((error) => {
      console.error("Realtime subscription error:", error);
      // Try to resubscribe
      channel = supabase
        .channel('risk_hazards_channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'risk_hazards_and_controls',
            filter: `risk_assessment_id=eq.${riskAssessmentId}`
          },
          async (payload) => {
            console.log("New hazard added (resubscribed):", payload);
            await refetchHazards();
            setHasNewHazards(true);
            setIsGenerationComplete(true);
            setProcessingDialogOpen(true);
          }
        )
        .subscribe();
    });

    return () => {
      console.log('Cleaning up realtime subscription');
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [riskAssessmentId, refetchHazards]);

  const handleProcessingDialogClose = () => {
    console.log("Closing processing dialog");
    setProcessingDialogOpen(false);
    setIsGenerationComplete(false);
    setHasNewHazards(false);
  };

  const autoGenerateMutation = useMutation({
    mutationFn: async () => {
      if (!riskAssessmentId || !siteRegister?.product?.id) {
        toast({
          title: "Error",
          description: "Missing required information",
          variant: "destructive",
        });
        return;
      }

      try {
        setProcessingDialogOpen(true);
        setIsGenerationComplete(false);
        setHasNewHazards(false);

        console.log("Starting auto-generation process...");

        const { error } = await supabase
          .from('risk_assessments')
          .update({ auto_generate_hazards: true })
          .eq('id', riskAssessmentId);

        if (error) throw error;

        console.log("Auto-generate triggered... waiting for realtime update");

        // Fallback in case realtime doesn't trigger
        setTimeout(async () => {
          if (!hasNewHazards) {
            console.log("No hazards detected after timeout, forcing refresh...");
            await refetchHazards();
            setIsGenerationComplete(true);
            setProcessingDialogOpen(true);
          }
        }, 5000);

      } catch (error) {
        console.error('Auto-generate failed:', error);
        setProcessingDialogOpen(false);
        toast({
          title: "Error",
          description: "Failed to auto-generate hazards",
          variant: "destructive",
        });
        throw error;
      }
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (hazardsToSave: any[]) => {
      if (!riskAssessmentId) return;

      const { error } = await supabase
        .from('risk_hazards_and_controls')
        .upsert(
          hazardsToSave.map(hazard => ({
            ...hazard,
            risk_assessment_id: riskAssessmentId
          }))
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-hazards', riskAssessmentId] });
      toast({
        title: "Success",
        description: "Hazards and controls saved successfully"
      });
    },
    onError: (error) => {
      console.error('Error saving hazards:', error);
      toast({
        title: "Error",
        description: "Failed to save hazards and controls",
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
          ...(field === 'likelihood_id' ? {
            likelihood_text: likelihoodOptions?.find(l => l.id === value)?.name
          } : {}),
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

      <Dialog 
        open={processingDialogOpen} 
        onOpenChange={(open) => {
          console.log("Dialog onOpenChange:", { open, isGenerationComplete });
          if (!open && isGenerationComplete) {
            handleProcessingDialogClose();
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isGenerationComplete ? "Auto-Generation Complete" : "Auto-Generation in Progress"}
            </DialogTitle>
            <DialogDescription>
              {isGenerationComplete 
                ? hasNewHazards 
                  ? "Hazards and controls have been successfully generated. Click OK to continue."
                  : "No new hazards were generated. This could mean all relevant hazards already exist."
                : "Your auto-generation is in progress. The records will refresh once done."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {isGenerationComplete && (
              <Button onClick={handleProcessingDialogClose}>OK</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {hazards.length === 0 && !readOnly && (
        <div className="text-center py-6 text-gray-500">
          No hazards and controls added yet.
        </div>
      )}
    </div>
  );
});

RiskHazardsAndControls.displayName = "RiskHazardsAndControls";
