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

  const saveMutation = useMutation({
    mutationFn: async (hazardsData: any[]) => {
      if (!riskAssessmentId) return;

      // Split hazards into copied (with hazard_control_id) and manual hazards
      const copiedHazards = hazardsData.filter(h => h.hazard_control_id);
      const manualHazards = hazardsData.filter(h => !h.hazard_control_id);

      console.log('Saving copied hazards:', copiedHazards.length);
      console.log('Saving manual hazards:', manualHazards.length);

      // Handle copied hazards - use composite key
      if (copiedHazards.length > 0) {
        const copiedHazardsToSave = copiedHazards.map(h => ({
          id: h.id, // Keep the existing ID if it exists
          risk_assessment_id: riskAssessmentId,
          hazard_control_id: h.hazard_control_id,
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
          source: 'Product'
        }));

        // Get existing hazard records to preserve IDs
        const { data: existingHazards, error: fetchError } = await supabase
          .from('risk_hazards_and_controls')
          .select('id, hazard_control_id')
          .eq('risk_assessment_id', riskAssessmentId)
          .not('hazard_control_id', 'is', null);

        if (fetchError) {
          console.error('Error fetching existing hazards:', fetchError);
          throw fetchError;
        }

        // Create a map of hazard_control_id to record id
        const existingHazardMap = new Map(
          existingHazards?.map(h => [h.hazard_control_id, h.id]) || []
        );

        // Update records with existing IDs where available
        const finalCopiedHazards = copiedHazardsToSave.map(h => ({
          ...h,
          id: existingHazardMap.get(h.hazard_control_id) || h.id
        }));

        const { error: copiedError } = await supabase
          .from('risk_hazards_and_controls')
          .upsert(finalCopiedHazards, {
            onConflict: 'risk_assessment_id,hazard_control_id',
            ignoreDuplicates: false
          });

        if (copiedError) {
          console.error('Error saving copied hazards:', copiedError);
          throw copiedError;
        }
      }

      // Handle manual hazards - use primary key
      if (manualHazards.length > 0) {
        const manualHazardsToSave = manualHazards.map(h => ({
          id: h.id, // Keep the existing ID
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
          source: 'Manual'
        }));

        const { error: manualError } = await supabase
          .from('risk_hazards_and_controls')
          .upsert(manualHazardsToSave, {
            onConflict: 'id',
            ignoreDuplicates: false
          });

        if (manualError) {
          console.error('Error saving manual hazards:', manualError);
          throw manualError;
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['risk-hazards', riskAssessmentId] });
    }
  });

  const autoGenerateMutation = useMutation({
    mutationFn: async () => {
      if (!riskAssessmentId || !siteRegister?.product?.id) {
        toast({
          title: "Error",
          description: "Missing required information for auto-generation",
          variant: "destructive",
        });
        return;
      }

      // Get existing hazard_control_ids for this risk assessment
      const { data: existingHazards } = await supabase
        .from('risk_hazards_and_controls')
        .select('hazard_control_id')
        .eq('risk_assessment_id', riskAssessmentId)
        .not('hazard_control_id', 'is', null);

      const existingHazardIds = existingHazards?.map(h => h.hazard_control_id) || [];
      console.log('Existing hazard control IDs:', existingHazardIds);

      // Get all product hazards
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

      if (hazardsError) {
        console.error('Error fetching product hazards:', hazardsError);
        toast({
          title: "Error",
          description: "Failed to fetch product hazards",
          variant: "destructive",
        });
        throw hazardsError;
      }

      // Filter to only get hazards that don't already exist
      const newHazards = productHazards?.filter(
        ph => !existingHazardIds.includes(ph.hazard_control_id)
      );

      console.log('New hazards to be added:', newHazards?.length);

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
          .upsert(hazardsToInsert, {
            onConflict: 'risk_assessment_id,hazard_control_id',
            ignoreDuplicates: true
          });

        if (insertError) {
          console.error('Error inserting new hazards:', insertError);
          toast({
            title: "Error",
            description: "Failed to add new hazards",
            variant: "destructive",
          });
          throw insertError;
        }

        toast({
          title: "Success",
          description: `Added ${hazardsToInsert.length} new hazards and controls`,
        });

        queryClient.invalidateQueries({ queryKey: ['risk-hazards', riskAssessmentId] });
        return hazardsToInsert;
      } else {
        toast({
          title: "Information",
          description: "No new hazards to add",
        });
        return [];
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
      setDeleteDialogOpen(false);
      setHazardToDelete(null);
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to delete hazard and control",
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

  const handleDeleteClick = (id: string) => {
    setHazardToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (hazardToDelete) {
      await deleteMutation.mutate(hazardToDelete);
      setHazards(hazards.filter(h => h.id !== hazardToDelete));
      setOpenItems(openItems.filter(item => item !== hazardToDelete));
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
          <TableRow className="border-b">
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

      {hazards.length === 0 && !readOnly && (
        <div className="text-center py-6 text-gray-500">
          No hazards and controls added yet.
        </div>
      )}
    </div>
  );
});

RiskHazardsAndControls.displayName = "RiskHazardsAndControls";
