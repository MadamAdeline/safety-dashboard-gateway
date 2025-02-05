import { DashboardLayout } from "@/components/DashboardLayout";

const ComplianceDashboard = () => {
  console.log("Rendering ComplianceDashboard page");
  
  return (
    <DashboardLayout>
      <div className="w-full h-full">
        <iframe 
          title="Compliance Dashboard" 
          width="1140" 
          height="836" 
          src="https://app.powerbi.com/view?r=eyJrIjoiMTJlZmJhOWUtMjMwOC00ZTM3LTk1MjctNjc3Njc1N2JmMThlIiwidCI6Ijg4ZjA3OTQ0LTY4MDYtNDQxMC04NjljLWY1MTFmYzQ1NzQzZiJ9&pageName=6ec8cf26dad2d397ed41" 
          frameBorder="0" 
          allowFullScreen={true}
        />
      </div>
    </DashboardLayout>
  );
};

export default ComplianceDashboard;