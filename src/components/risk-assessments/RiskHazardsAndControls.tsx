import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface HazardData {
  id?: string;
  hazard_type_id: any;
  hazard: string;
  control: string;
  source: string;
  likelihood_id: any;
  consequence_id: any;
  risk_score_id: any;
  control_in_place: boolean;
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
  const [hazards, setHazards] = useState<HazardData[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hazardToDeleteIndex, setHazardToDeleteIndex] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

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

  const fetchExistingHazards = async (riskAssessmentId: string) => {
    const { data, error } = await supabase
      .from('risk_assessment_hazards')
      .select(`
        id,
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

    if (error) {
      console.error('Error fetching existing hazards:', error);
      toast({
        title: "Error",
        description: "Failed to load existing hazards",
        variant: "destructive"
      });
      return [];
    }

    return data;
  };

  useEffect(() => {
    if (riskAssessmentId) {
      fetchExistingHazards(riskAssessmentId).then(existingHazards => {
        setHazards(existingHazards);
      });
    }
  }, [riskAssessmentId, toast]);

  useImperativeHandle(ref, () => ({
    handleAdd: () => {
      setHazards(prevHazards => [...prevHazards, {
        hazard_type_id: null,
        hazard: "",
        control: "",
        source: "",
        likelihood_id: null,
        consequence_id: null,
        risk_score_id: null,
        control_in_place: false
      }]);
    },
    saveHazards: async (riskAssessmentId: string) => {
      try {
        // Delete existing hazards for the risk assessment
        const { error: deleteError } = await supabase
          .from('risk_assessment_hazards')
          .delete()
          .eq('risk_assessment_id', riskAssessmentId);

        if (deleteError) {
          console.error('Error deleting existing hazards:', deleteError);
          throw deleteError;
        }

        // Prepare the hazards data for insertion
        const hazardsToInsert = hazards.map(hazard => ({
          risk_assessment_id: riskAssessmentId,
          hazard_type_id: hazard.hazard_type_id || null,
          hazard: hazard.hazard,
          control: hazard.control,
          source: hazard.source,
          likelihood_id: hazard.likelihood_id || null,
          consequence_id: hazard.consequence_id || null,
          risk_score_id: hazard.risk_score_id || null,
          control_in_place: hazard.control_in_place
        }));

        // Insert the new hazards
        const { data, error: insertError } = await supabase
          .from('risk_assessment_hazards')
          .insert(hazardsToInsert)
          .select();

        if (insertError) {
          console.error('Error saving hazards:', insertError);
          throw insertError;
        }

        toast({
          title: "Success",
          description: "Hazards and controls saved successfully"
        });

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({
          queryKey: ['risk-assessments']
        });
      } catch (error) {
        console.error('Error saving hazards:', error);
        toast({
          title: "Error",
          description: "Failed to save hazards and controls",
          variant: "destructive"
        });
      }
    },
    populateHazards: (hazards: any[]) => {
      setHazards(hazards);
    }
  }), [hazards, queryClient, toast]);

  const handleHazardChange = (index: number, field: string, value: any) => {
    setHazards(prevHazards => {
      const newHazards = [...prevHazards];
      newHazards[index][field] = value;
      return newHazards;
    });
  };

  const handleRemoveHazard = (index: number) => {
    setHazardToDeleteIndex(index);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteHazard = () => {
    if (hazardToDeleteIndex !== null) {
      setHazards(prevHazards => {
        const newHazards = [...prevHazards];
        newHazards.splice(hazardToDeleteIndex, 1);
        return newHazards;
      });
      setHazardToDeleteIndex(null);
      setDeleteDialogOpen(false);
    }
  };

  const toggleRowExpand = (index: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  const getRiskScore = async (likelihoodId: any, consequenceId: any) => {
    if (!likelihoodId || !consequenceId) return null;

    try {
      const { data, error } = await supabase
        .from('risk_matrix')
        .select('*')
        .eq('likelihood_id', likelihoodId)
        .eq('consequence_id', consequenceId)
        .single();

      if (error) {
        console.error('Error fetching risk score:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching risk score:', error);
      return null;
    }
  };

  const handleLikelihoodChange = async (index: number, value: any) => {
    handleHazardChange(index, 'likelihood_id', value);

    const consequenceId = hazards[index].consequence_id;
    if (consequenceId) {
      const riskScore = await getRiskScore(value, consequenceId);
      handleHazardChange(index, 'risk_score_id', riskScore?.id || null);
    }
  };

  const handleConsequenceChange = async (index: number, value: any) => {
    handleHazardChange(index, 'consequence_id', value);

    const likelihoodId = hazards[index].likelihood_id;
    if (likelihoodId) {
      const riskScore = await getRiskScore(likelihoodId, value);
      handleHazardChange(index, 'risk_score_id', riskScore?.id || null);
    }
  };

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
          {hazards.map((hazard, index) => {
            const riskScoreId = hazard.risk_score_id;
            const riskScore = riskScoreId ? (
              () => {
                const { data } = useQuery({
                  queryKey: ['risk-score', riskScoreId],
                  queryFn: async () => {
                    const { data, error } = await supabase
                      .from('risk_matrix')
                      .select('*')
                      .eq('id', riskScoreId)
                      .single();
                    if (error) throw error;
                    return data;
                  },
                });
                return data;
              }
            )() : null;

            return (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell className="p-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 data-[state=open]:bg-muted hover:bg-accent focus:bg-accent"
                      onClick={() => toggleRowExpand(index)}
                    >
                      {expandedRows.has(index) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <span className="sr-only">Toggle row visibility</span>
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{
                      hazardTypes?.find(ht => ht.id === hazard.hazard_type_id)?.label || "N/A"
                    }</TableCell>
                  <TableCell>{hazard.hazard}</TableCell>
                  <TableCell>{hazard.control}</TableCell>
                  <TableCell className="text-center">
                    {riskScore && (
                      <Badge style={{ backgroundColor: riskScore.risk_color || '#gray-400', color: '#FFFFFF' }}>
                        {riskScore.risk_label}
                      </Badge>
                    )}
                  </TableCell>
                  {!readOnly && (
                    <TableCell className="text-center">
                      <Button variant="destructive" size="icon" onClick={() => handleRemoveHazard(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>

                {/* Collapsible Row */}
                {expandedRows.has(index) && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Hazard Details */}
                        <div className="space-y-2">
                          <Label htmlFor={`hazard-type-${index}`}>Hazard Type</Label>
                          <Select 
                            id={`hazard-type-${index}`}
                            value={hazard.hazard_type_id || ""} 
                            onValueChange={(value) => handleHazardChange(index, 'hazard_type_id', value)}
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
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`hazard-${index}`}>Hazard Description</Label>
                          <Textarea
                            id={`hazard-${index}`}
                            value={hazard.hazard}
                            onChange={(e) => handleHazardChange(index, 'hazard', e.target.value)}
                            disabled={readOnly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`control-${index}`}>Control Description</Label>
                          <Textarea
                            id={`control-${index}`}
                            value={hazard.control}
                            onChange={(e) => handleHazardChange(index, 'control', e.target.value)}
                            disabled={readOnly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`source-${index}`}>Source</Label>
                          <Input
                            type="text"
                            id={`source-${index}`}
                            value={hazard.source}
                            onChange={(e) => handleHazardChange(index, 'source', e.target.value)}
                            disabled={readOnly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`likelihood-${index}`}>Likelihood</Label>
                          <Select 
                            id={`likelihood-${index}`}
                            value={hazard.likelihood_id || ""} 
                            onValueChange={(value) => handleLikelihoodChange(index, value)}
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
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`consequence-${index}`}>Consequence</Label>
                          <Select 
                            id={`consequence-${index}`}
                            value={hazard.consequence_id || ""} 
                            onValueChange={(value) => handleConsequenceChange(index, value)}
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
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this hazard and control?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setHazardToDeleteIndex(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteHazard}>Delete</AlertDialogAction>
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
