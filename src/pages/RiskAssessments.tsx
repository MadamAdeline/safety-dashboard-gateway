
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

  return (
    <DashboardLayout>
      {isFormOpen ? (
        <RiskAssessmentForm
          onClose={handleClose}
          initialData={selectedRiskAssessment}
        />
      ) : (
        <RiskAssessmentList
          onEdit={handleEdit}
          onNew={handleNew}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />
      )}
    </DashboardLayout>
  );
}
