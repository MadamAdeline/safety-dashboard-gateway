import { useState, useEffect } from "react";
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
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface RiskAssessmentFormProps {
  onClose: () => void;
  initialData?: any | null;
}

interface FormData {
  site_register_record_id: string;
  risk_assessment_date: string;
  conducted_by: string;
  product_usage: string;
  overall_likelihood_id: number | null;
  overall_consequence_id: number | null;
  overall_evaluation: string;
  overall_evaluation_status_id: string;
  approval_status_id: string;
  approver: string;
  date_of_next_review: string;
}

export function RiskAssessmentForm({ onClose, initialData }: RiskAssessmentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSiteRegister, setSelectedSiteRegister] = useState<any>(null);
  const [riskScore, setRiskScore] = useState<any>(null);

  const [formData, setFormData] = useState<FormData>({
    site_register_record_id: initialData?.site_register_record_id || "",
    risk_assessment_date: initialData?.risk_assessment_date || format(new Date(), 'yyyy-MM-dd'),
    conducted_by: initialData?.conducted_by || "",
    product_usage: initialData?.product_usage || "",
    overall_likelihood_id: initialData?.overall_likelihood_id || null,
    overall_consequence_id: initialData?.overall_consequence_id || null,
    overall_evaluation: initialData?.overall_evaluation || "",
    overall_evaluation_status_id: initialData?.overall_evaluation_status_id || "",
    approval_status_id: initialData?.approval_status_id || "",
    approver: initialData?.approver || "",
    date_of_next_review: initialData?.date_of_next_review || "",
  });

  // Fetch users for dropdowns
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .eq('active', 'active')
        .order('first_name', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // Fetch site register details
  const { data: siteRegister } = useQuery({
    queryKey: ['site-register', formData.site_register_record_id],
    queryFn: async () => {
      if (!formData.site_register_record_id) return null;
      const { data, error } = await supabase
        .from('site_registers')
        .select(`
          *,
          location:locations (name, full_path),
          product:products (product_name)
        `)
        .eq('id', formData.site_register_record_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!formData.site_register_record_id
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

  // Fetch evaluation statuses
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

  // Fetch approval statuses
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

  // Update risk score when likelihood or consequence changes
  useEffect(() => {
    const updateRiskScore = async () => {
      if (formData.overall_likelihood_id && formData.overall_consequence_id) {
        const { data, error } = await supabase
          .from('risk_matrix')
          .select('*')
          .eq('likelihood_id', formData.overall_likelihood_id)
          .eq('consequence_id', formData.overall_consequence_id)
          .single();
        
        if (error) {
          console.error('Error fetching risk score:', error);
          return;
        }
        
        setRiskScore(data);
      }
    };

    updateRiskScore();
  }, [formData.overall_likelihood_id, formData.overall_consequence_id]);

  // Handle search selection
  const handleSiteRegisterSelect = (siteRegister: any) => {
    setSelectedSiteRegister(siteRegister);
    setFormData(prev => ({
      ...prev,
      site_register_record_id: siteRegister.id
    }));
  };

  // Handle form submission
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('risk_assessments')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-assessments'] });
      toast({
        title: "Success",
        description: "Risk assessment has been created"
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error creating risk assessment:', error);
      toast({
        title: "Error",
        description: "Failed to create risk assessment",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    // TODO: Add validation
    createMutation.mutate(formData);
  };

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
          <Button 
            className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
            onClick={handleSave}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Saving..." : "Save"}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Site Register Search Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Site Register Information</h2>
          {selectedSiteRegister ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Location:</strong> {siteRegister?.location?.full_path}</p>
              <p><strong>Product:</strong> {siteRegister?.product?.product_name}</p>
            </div>
          ) : (
            <div>
              {/* TODO: Implement site register search component */}
              <Input 
                placeholder="Search for a site register record..."
                onChange={(e) => console.log(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Risk Assessment Header Fields */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Risk Assessment Date</Label>
            <Input
              type="date"
              value={formData.risk_assessment_date}
              onChange={(e) => setFormData({ ...formData, risk_assessment_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Assessed By</Label>
            <Select 
              value={formData.conducted_by}
              onValueChange={(value) => setFormData({ ...formData, conducted_by: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assessor" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {`${user.first_name} ${user.last_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-2">
            <Label>Product Usage</Label>
            <Textarea
              value={formData.product_usage}
              onChange={(e) => setFormData({ ...formData, product_usage: e.target.value })}
            />
          </div>
        </div>

        {/* Risk Assessment Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Risk Assessment</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Overall Likelihood</Label>
              <Select
                value={formData.overall_likelihood_id?.toString() || ""}
                onValueChange={(value) => setFormData({ ...formData, overall_likelihood_id: parseInt(value) })}
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
            </div>

            <div className="space-y-2">
              <Label>Overall Consequence</Label>
              <Select
                value={formData.overall_consequence_id?.toString() || ""}
                onValueChange={(value) => setFormData({ ...formData, overall_consequence_id: parseInt(value) })}
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
            </div>

            {riskScore && (
              <div className="col-span-2">
                <Label>Overall Risk Level</Label>
                <div className="mt-2">
                  <Badge
                    style={{
                      backgroundColor: riskScore.risk_color,
                      color: '#FFF'
                    }}
                  >
                    {riskScore.risk_label}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* TODO: Add Risk Matrix Image */}
          <div className="bg-gray-100 p-4 rounded-lg mt-4">
            <p className="text-gray-500 text-sm">Risk Matrix will be displayed here</p>
          </div>
        </div>

        {/* Approval Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Approval</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <Label>Overall Evaluation</Label>
              <Textarea
                value={formData.overall_evaluation}
                onChange={(e) => setFormData({ ...formData, overall_evaluation: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Overall Evaluation Status</Label>
              <Select
                value={formData.overall_evaluation_status_id}
                onValueChange={(value) => setFormData({ ...formData, overall_evaluation_status_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {evaluationStatuses?.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Approval Status</Label>
              <Select
                value={formData.approval_status_id}
                onValueChange={(value) => setFormData({ ...formData, approval_status_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {approvalStatuses?.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Approver</Label>
              <Select
                value={formData.approver}
                onValueChange={(value) => setFormData({ ...formData, approver: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select approver" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {`${user.first_name} ${user.last_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date of Next Review</Label>
              <Input
                type="date"
                value={formData.date_of_next_review}
                onChange={(e) => setFormData({ ...formData, date_of_next_review: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
