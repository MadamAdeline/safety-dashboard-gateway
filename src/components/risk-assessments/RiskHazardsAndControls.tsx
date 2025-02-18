
import React, { useState, forwardRef, useImperativeHandle } from "react";
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

interface Hazard {
  id: string;
  risk_assessment_id: string;
  hazard_type_id: string;
  hazard: string;
  control: string;
  control_in_place: boolean;
  source: string;
  likelihood_id?: string;
  consequence_id?: string;
  hazard_control_id?: string;
  created_at?: string;
  hazard_type?: {
    id: string;
    label: string;
  };
  product_hazard?: {
    hazard_control_id: string;
    hazard: string;
    control: string;
    hazard_type: string;
  };
  risk_score?: any;
}

interface RiskHazardsAndControlsProps {
  riskAssessmentId: string | null;
  readOnly?: boolean;
}

export interface RiskHazardsAndControlsRef {
  handleAdd: () => void;
  saveHazards: (riskAssessmentId: string) => Promise<void>;
  populateHazards: (hazards: Hazard[]) => void;
}

export const RiskHazardsAndControls = forwardRef<RiskHazardsAndControlsRef, RiskHazardsAndControlsProps>(({ riskAssessmentId, readOnly }, ref) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hazardToDelete, setHazardToDelete] = useState<string | null>(null);

  // Fetch hazard types and options
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

  // Main hazards query
  const { data: hazards = [], refetch: refetchHazards } = useQuery({
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

      // Add risk scores
      return Promise.all((data || []).map(async (hazard) => {
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

  // Get site register data for auto-generation
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

  const handleAdd = async () => {
    if (!hazardTypes?.length || !riskAssessmentId) return;

    const newHazard = {
      id: crypto.randomUUID(),
      risk_assessment_id: riskAssessmentId,
      hazard_type_id: hazardTypes[0].id,
      hazard: "",
      control: "",
      control_in_place: false,
      source: "Manual"
    };

    const { error } = await supabase
      .from('risk_hazards_and_controls')
      .insert([newHazard]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add new hazard",
        variant: "destructive"
      });
      return;
    }

    await refetchHazards();
    setOpenItems([newHazard.id]);
  };

  const handleUpdate = async (id: string, field: string, value: any) => {
    const { error } = await supabase
      .from('risk_hazards_and_controls')
      .update({ [field]: value })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update hazard",
        variant: "destructive"
      });
      return;
    }

    await refetchHazards();
  };

  const deleteMutation = useMutation({
    mutationFn: async (hazardId: string) => {
      const { error } = await supabase
        .from('risk_hazards_and_controls')
        .delete()
        .eq('id', hazardId);

      if (error) throw error;
    },
    onSuccess: () => {
      refetchHazards();
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

      // Get existing hazard control IDs
      const existingIds = new Set(
        hazards.map(h => h.hazard_control_id).filter(Boolean)
      );

      // Get product hazards
      const { data: productHazards, error: fetchError } = await supabase
        .from('hazards_and_controls')
        .select('*')
        .eq('product_id', siteRegister.product.id);

      if (fetchError) throw fetchError;

      // Filter new hazards
      const newHazards = (productHazards || []).filter(
        ph => ph.hazard_control_id && !existingIds.has(ph.hazard_control_id)
      );

      if (!newHazards.length) {
        toast({
          title: "Information",
          description: "No new hazards to add",
        });
        return;
      }

      // Insert new hazards
      const { error: insertError } = await supabase
        .from('risk_hazards_and_controls')
        .insert(newHazards.map(ph => ({
          risk_assessment_id: riskAssessmentId,
          hazard_type_id: ph.hazard_type,
          hazard: ph.hazard,
          control: ph.control,
          hazard_control_id: ph.hazard_control_id,
          source: "Product",
          control_in_place: false
        })));

      if (insertError) throw insertError;

      await refetchHazards();
      
      toast({
        title: "Success",
        description: `Added ${newHazards.length} new hazards`,
      });
    }
  });

  useImperativeHandle(ref, () => ({
    handleAdd,
    saveHazards: async () => {
      await refetchHazards();
    },
    populateHazards: () => {
      refetchHazards();
    }
  }));

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Hazards and Controls</h2>
      {hazards.length === 0 ? (
        <p className="text-gray-500">No hazards added for this risk assessment.</p>
      ) : (
        <ul className="space-y-2">
          {hazards.map(hazard => (
            <li key={hazard.id} className="border p-2 rounded">
              <p className="font-semibold">{hazard.hazard}</p>
              <p className="text-sm text-gray-500">Control: {hazard.control}</p>
              <p className="text-sm text-gray-400">Source: {hazard.source}</p>
            </li>
          ))}
        </ul>
      )}

      <Button
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        onClick={handleAdd}
      >
        Add Hazard
      </Button>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hazard</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hazard? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(hazardToDelete!)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

RiskHazardsAndControls.displayName = "RiskHazardsAndControls";
