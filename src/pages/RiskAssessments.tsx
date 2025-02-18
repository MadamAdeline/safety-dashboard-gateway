
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RiskAssessmentList } from "@/components/risk-assessments/RiskAssessmentList";
import { RiskAssessmentForm } from "@/components/risk-assessments/RiskAssessmentForm";

export default function RiskAssessments() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRiskAssessment, setSelectedRiskAssessment] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleNew = () => {
    setSelectedRiskAssessment(null);
    setIsFormOpen(true);
  };

  const handleEdit = (riskAssessment: any) => {
    setSelectedRiskAssessment(riskAssessment);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setSelectedRiskAssessment(null);
  };

  if (isFormOpen) {
    return (
      <DashboardLayout>
        <RiskAssessmentForm
          onClose={handleClose}
          initialData={selectedRiskAssessment}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-dgxprt-navy">Risk Assessments</h1>
        </div>
        
        <RiskAssessmentList
          onEdit={handleEdit}
          onNew={handleNew}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />
      </div>
    </DashboardLayout>
  );
}
