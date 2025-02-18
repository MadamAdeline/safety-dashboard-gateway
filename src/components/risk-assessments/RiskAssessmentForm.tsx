import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { SiteRegisterSearch } from "./SiteRegisterSearch";
import { RiskHazardsAndControls } from "./RiskHazardsAndControls";

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
  overall_risk_score_id: number | null;
}

export function RiskAssessmentForm({
  onClose,
  initialData
}: RiskAssessmentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSiteRegister, setSelectedSiteRegister] = useState<any>(null);
  const [riskScore, setRiskScore] = useState<any>(null);
  const hazardsControlsRef = useRef<{
    saveHazards: () => Promise<void>;
    populateHazards: (hazards: any[]) => void;
  }>(null);
  const [formData, setFormData] = useState<FormData>({
    site_register_record_id: initialData?.site_register_record_id || "",
    risk_assessment_date: initialData?.risk_assessment_date ? format(new Date(initialData.risk_assessment_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    conducted_by: initialData?.conducted_by || "",
    product_usage: initialData?.product_usage || "",
    overall_likelihood_id: initialData?.overall_likelihood_id || null,
    overall_consequence_id: initialData?.overall_consequence_id || null,
    overall_evaluation: initialData?.overall_evaluation || "",
    overall_evaluation_status_id: initialData?.overall_evaluation_status_id || "",
    approval_status_id: initialData?.approval_status_id || "",
    approver: initialData?.approver || "",
    date_of_next_review: initialData?.date_of_next_review || "",
    overall_risk_score_id: initialData?.overall_risk_score_id || null
  });

  const {
    data: users
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('users').select('id, first_name, last_name').eq('active', 'active').order('first_name', {
        ascending: true
      });
      if (error) throw error;
      return data;
    }
  });

  const {
    data: siteRegister,
    error: siteRegisterError
  } = useQuery({
    queryKey: ['site-register', formData.site_register_record_id],
    queryFn: async () => {
      if (!formData.site_register_record_id) return null;
      
      try {
        const { data, error } = await supabase
          .from('site_registers')
          .select(`
            id,
            location_id,
            product_id,
            current_stock_level,
            max_stock_level,
            total_qty,
            exact_location,
            override_product_name,
            storage_conditions,
            placarding_required,
            manifest_required,
            fire_protection_required,
            location:locations (
              id,
              name,
              full_path
            ),
            product:products (
              id,
              product_name,
              product_code,
              brand_name,
              unit,
              unit_size,
              uom_id,
              description,
              uses,
              other_names,
              product_status_id
            )
          `)
          .eq('id', formData.site_register_record_id)
          .single();

        if (error) {
          console.error('Error fetching site register:', error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error('Error in site register query:', error);
        throw error;
      }
    },
    enabled: !!formData.site_register_record_id
  });

  useEffect(() => {
    if (siteRegisterError) {
      toast({
        title: "Error",
        description: "Failed to load site register details",
        variant: "destructive"
      });
    }
  }, [siteRegisterError, toast]);

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
    data: evaluationStatuses
  } = useQuery({
    queryKey: ['evaluation-statuses'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('master_data').select('*').eq('category', 'RISK_OVERALL_STATUS').eq('status', 'ACTIVE').order('sort_order', {
        ascending: true
      });
      if (error) throw error;
      return data;
    }
  });

  const {
    data: approvalStatuses
  } = useQuery({
    queryKey: ['approval-statuses'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('master_data').select('*').eq('category', 'RISK_APPROVAL_STATUS').eq('status', 'ACTIVE').order('sort_order', {
        ascending: true
      });
      if (error) throw error;
      return data;
    }
  });

  const {
    data: productHazards
  } = useQuery({
    queryKey: ['product-hazards', siteRegister?.product?.id],
    queryFn: async () => {
      if (!siteRegister?.product?.id) return null;
      
      const { data, error } = await supabase
        .from('hazards_and_controls')
        .select(`
          hazard_control_id,
          hazard_type,
          hazard,
          control,
          source,
          hazardType:master_data!hazards_and_controls_hazard_type_fkey (
            id,
            label
          )
        `)
        .eq('product_id', siteRegister.product.id);

      if (error) throw error;
      return data;
    },
    enabled: !!siteRegister?.product?.id
  });

  useEffect(() => {
    if (initialData?.site_register_record_id) {
      setSelectedSiteRegister({
        id: initialData.site_register_record_id
      });
    }
  }, [initialData]);

  useEffect(() => {
    const updateRiskScore = async () => {
      if (formData.overall_likelihood_id && formData.overall_consequence_id) {
        const {
          data,
          error
        } = await supabase.from('risk_matrix').select('*').eq('likelihood_id', formData.overall_likelihood_id).eq('consequence_id', formData.overall_consequence_id).single();
        if (error) {
          console.error('Error fetching risk score:', error);
          return;
        }
        setRiskScore(data);
        setFormData(prev => ({
          ...prev,
          overall_risk_score_id: data.id
        }));
      }
    };
    updateRiskScore();
  }, [formData.overall_likelihood_id, formData.overall_consequence_id]);

  useEffect(() => {
    if (productHazards && hazardsControlsRef.current && !initialData) {
      const mappedHazards = productHazards.map(ph => ({
        hazard_type_id: ph.hazard_type,
        hazard: ph.hazard,
        control: ph.control,
        source: ph.source,
        likelihood_id: null,
        consequence_id: null,
        risk_score_id: null,
        control_in_place: false
      }));
      
      hazardsControlsRef.current.populateHazards(mappedHazards);
    }
  }, [productHazards, initialData]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const {
        error
      } = await supabase.from('risk_assessments').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['risk-assessments']
      });
      toast({
        title: "Success",
        description: "Risk assessment has been created"
      });
      onClose();
    },
    onError: error => {
      console.error('Error creating risk assessment:', error);
      toast({
        title: "Error",
        description: "Failed to create risk assessment",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const {
        error
      } = await supabase.from('risk_assessments').update(data).eq('id', initialData.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['risk-assessments']
      });
      toast({
        title: "Success",
        description: "Risk assessment has been updated"
      });
      onClose();
    },
    onError: error => {
      console.error('Error updating risk assessment:', error);
      toast({
        title: "Error",
        description: "Failed to update risk assessment",
        variant: "destructive"
      });
    }
  });

  const handleSave = async () => {
    try {
      let riskAssessmentId = initialData?.id;
      if (initialData?.id) {
        await updateMutation.mutateAsync(formData);
      } else {
        const {
          data,
          error
        } = await supabase.from('risk_assessments').insert([formData]).select().single();
        if (error) throw error;
        riskAssessmentId = data.id;
      }

      // Save hazards and controls
      if (hazardsControlsRef.current) {
        await hazardsControlsRef.current.saveHazards();
      }
      queryClient.invalidateQueries({
        queryKey: ['risk-assessments']
      });
      toast({
        title: "Success",
        description: initialData ? "Risk assessment updated" : "Risk assessment created"
      });
      onClose();
    } catch (error) {
      console.error('Error saving risk assessment:', error);
      toast({
        title: "Error",
        description: "Failed to save risk assessment",
        variant: "destructive"
      });
    }
  };

  const handleSiteRegisterSelect = (siteRegister: any) => {
    setSelectedSiteRegister(siteRegister);
    setFormData(prev => ({
      ...prev,
      site_register_record_id: siteRegister.id
    }));
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {initialData ? "Edit Risk Assessment" : "New Risk Assessment"}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-dgxprt-purple hover:bg-dgxprt-purple/90" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : initialData ? "Update" : "Save"}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Risk Assessment Details</TabsTrigger>
          <TabsTrigger value="assessment">Hazards & Controls</TabsTrigger>
          <TabsTrigger value="approval">Evaluation & Approval</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="border-t pt-4">
                <div className="bg-gray-50 py-2 rounded-md">
                  <h2 className="text-lg font-semibold">Site Register Information</h2>
                </div>
              </div>
              {selectedSiteRegister ? <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Location:</strong> {siteRegister?.location?.full_path}</p>
                  <p><strong>Product:</strong> {siteRegister?.product?.product_name}</p>
                  {!initialData && <Button variant="outline" size="sm" onClick={() => {
                setSelectedSiteRegister(null);
                setFormData(prev => ({
                  ...prev,
                  site_register_record_id: ""
                }));
              }}>
                      Change the Site Register's Product
                    </Button>}
                </div> : !initialData && <SiteRegisterSearch onSelect={handleSiteRegisterSelect} className="w-full" />}
            </div>

            <div className="space-y-4">
              <div className="border-t pt-4">
                <div className="bg-gray-50 py-2 rounded-md">
                  <h2 className="text-lg font-semibold">Assessment Details</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Risk Assessment Date</Label>
                  <Input type="date" value={formData.risk_assessment_date} onChange={e => setFormData({
                  ...formData,
                  risk_assessment_date: e.target.value
                })} />
                </div>

                <div className="space-y-2">
                  <Label>Assessed By</Label>
                  <Select value={formData.conducted_by} onValueChange={value => setFormData({
                  ...formData,
                  conducted_by: value
                })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessor" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map(user => <SelectItem key={user.id} value={user.id}>
                          {`${user.first_name} ${user.last_name}`}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Product Usage</Label>
                  <Textarea value={formData.product_usage} onChange={e => setFormData({
                  ...formData,
                  product_usage: e.target.value
                })} />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-6">
          <div className="space-y-6">
            <RiskHazardsAndControls riskAssessmentId={initialData?.id || null} readOnly={false} ref={hazardsControlsRef} />

            <div className="space-y-4">
              <div className="border-t pt-4">
                <div className="bg-gray-50 py-2 rounded-md">
                  <h2 className="text-lg font-semibold">Overall Risk Assessment</h2>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Overall Likelihood</Label>
                  <Select value={formData.overall_likelihood_id?.toString() || ""} onValueChange={value => setFormData({
                  ...formData,
                  overall_likelihood_id: parseInt(value)
                })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select likelihood" />
                    </SelectTrigger>
                    <SelectContent>
                      {likelihoodOptions?.map(option => <SelectItem key={option.id} value={option.id.toString()}>
                          {option.name}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Overall Consequence</Label>
                  <Select value={formData.overall_consequence_id?.toString() || ""} onValueChange={value => setFormData({
                  ...formData,
                  overall_consequence_id: parseInt(value)
                })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select consequence" />
                    </SelectTrigger>
                    <SelectContent>
                      {consequenceOptions?.map(option => <SelectItem key={option.id} value={option.id.toString()}>
                          {option.name}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {riskScore && <div className="space-y-2">
                    <Label>Overall Risk Level</Label>
                    <div className="h-10 flex items-center">
                      <Badge style={{
                    backgroundColor: riskScore.risk_color || '#gray-400',
                    color: '#FFFFFF'
                  }}>
                        {riskScore.risk_label}
                      </Badge>
                    </div>
                  </div>}
              </div>

              <div className="bg-white border rounded-lg p-4 mt-4">
                <img src="/lovable-uploads/2cadd5b5-9f69-4e43-83af-bfc20517cde2.png" alt="Risk Assessment Matrix" className="w-full max-w-3xl mx-auto" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="approval" className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2">
                <Label>Overall Evaluation</Label>
                <Textarea value={formData.overall_evaluation} onChange={e => setFormData({
                ...formData,
                overall_evaluation: e.target.value
              })} />
              </div>

              <div className="space-y-2">
                <Label>Overall Evaluation Status</Label>
                <Select value={formData.overall_evaluation_status_id} onValueChange={value => setFormData({
                ...formData,
                overall_evaluation_status_id: value
              })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {evaluationStatuses?.map(status => <SelectItem key={status.id} value={status.id}>
                        {status.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Approval Status</Label>
                <Select value={formData.approval_status_id} onValueChange={value => setFormData({
                ...formData,
                approval_status_id: value
              })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {approvalStatuses?.map(status => <SelectItem key={status.id} value={status.id}>
                        {status.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Approver</Label>
                <Select value={formData.approver} onValueChange={value => setFormData({
                ...formData,
                approver: value
              })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select approver" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map(user => <SelectItem key={user.id} value={user.id}>
                        {`${user.first_name} ${user.last_name}`}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date of Next Review</Label>
                <Input type="date" value={formData.date_of_next_review} onChange={e => setFormData({
                ...formData,
                date_of_next_review: e.target.value
              })} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
}
