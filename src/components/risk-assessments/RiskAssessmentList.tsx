
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Plus, Download, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface RiskAssessmentListProps {
  onEdit: (riskAssessment: any) => void;
  onNew: () => void;
  searchTerm: string;
  onSearch: (value: string) => void;
}

export function RiskAssessmentList({ 
  onEdit, 
  onNew, 
  searchTerm, 
  onSearch 
}: RiskAssessmentListProps) {
  const { toast } = useToast();

  const { data: riskAssessments, isLoading, refetch } = useQuery({
    queryKey: ['risk-assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risk_assessments')
        .select(`
          *,
          site_register:site_registers (
            id,
            location:locations (
              name,
              full_path
            ),
            products (
              product_name
            )
          ),
          assessor:users!risk_assessments_conducted_by_fkey (
            first_name,
            last_name
          ),
          likelihood (
            name
          ),
          consequence (
            name
          ),
          risk_matrix (
            risk_label,
            risk_color
          ),
          evaluation_status:master_data!risk_assessments_overall_evaluation_status_id_fkey (
            label
          ),
          approval_status:master_data!risk_assessments_approval_status_id_fkey (
            label
          )
        `)
        .order('risk_assessment_date', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: "Coming Soon",
      description: "Export functionality will be available soon",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-1/2">
          <Input
            placeholder="Search Risk Assessments..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={onNew}
            className="bg-dgxprt-purple hover:bg-dgxprt-purple/90 gap-2"
          >
            <Plus className="h-4 w-4" />
            Risk Assessment
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F1F0FB] border-b border-gray-200">
              <TableHead className="text-dgxprt-navy font-semibold">Location</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Product</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Assessment Date</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Assessed By</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Risk Level</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Evaluation Status</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Approval Status</TableHead>
              <TableHead className="w-24 text-dgxprt-navy font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {riskAssessments?.map((assessment) => (
              <TableRow 
                key={assessment.id}
                className="hover:bg-[#F1F0FB] transition-colors"
              >
                <TableCell>{assessment.site_register?.location?.full_path}</TableCell>
                <TableCell>{assessment.site_register?.products?.product_name}</TableCell>
                <TableCell>
                  {assessment.risk_assessment_date ? 
                    format(new Date(assessment.risk_assessment_date), 'dd/MM/yyyy') : 
                    '-'
                  }
                </TableCell>
                <TableCell>
                  {`${assessment.assessor?.first_name} ${assessment.assessor?.last_name}`}
                </TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor: assessment.risk_matrix?.risk_color,
                      color: '#FFF'
                    }}
                  >
                    {assessment.risk_matrix?.risk_label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {assessment.evaluation_status?.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {assessment.approval_status?.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="hover:bg-dgxprt-hover text-dgxprt-navy"
                    onClick={() => onEdit(assessment)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
