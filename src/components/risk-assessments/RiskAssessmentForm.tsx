
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteRegisterSearch } from "@/components/site-registers/list/SiteRegisterSearch";
import { format } from "date-fns";

interface RiskAssessmentFormProps {
  onClose: () => void;
  initialData?: any | null;
}

export function RiskAssessmentForm({ onClose, initialData }: RiskAssessmentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    site_register_record_id: initialData?.site_register_record_id || "",
    risk_assessment_date: initialData?.risk_assessment_date || format(new Date(), 'yyyy-MM-dd'),
    conducted_by: initialData?.conducted_by || "",
    product_usage: initialData?.product_usage || "",
    overall_likelihood_id: initialData?.overall_likelihood_id || "",
    overall_consequence_id: initialData?.overall_consequence_id || "",
    overall_evaluation: initialData?.overall_evaluation || "",
    overall_evaluation_status_id: initialData?.overall_evaluation_status_id || "",
    approval_status_id: initialData?.approval_status_id || "",
    approver: initialData?.approver || "",
    date_of_next_review: initialData?.date_of_next_review || "",
  });

  // Fetch lookup data
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

  const { data: evaluationStatuses } = useQuery({
    queryKey: ['evaluation-statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_data')
        .select('*')
        .eq('category', 'RISK_OVERALL_STATUS')
        .eq('status', 'ACTIVE')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const { data: approvalStatuses } = useQuery({
    queryKey: ['approval-statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_data')
        .select('*')
        .eq('category', 'RISK_APPROVAL_STATUS')
        .eq('status', 'ACTIVE')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // Handlers and mutations will be implemented in the next iteration

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {initialData ? "Edit Risk Assessment" : "New Risk Assessment"}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-dgxprt-purple hover:bg-dgxprt-purple/90">
            Save
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Form sections will be completed in the next iteration */}
      <div className="grid grid-cols-2 gap-6">
        {/* Add form fields here */}
      </div>
    </div>
  );
}
