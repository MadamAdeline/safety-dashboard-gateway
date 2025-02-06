
import { DashboardLayout } from "@/components/DashboardLayout";

const ComplianceDashboard = () => {
  console.log("Rendering ComplianceDashboard page");
  
  return (
    <DashboardLayout>
      <div className="w-full h-full p-4">
        <div className="w-full h-full aspect-[4/3] max-w-[1600px] mx-auto">
          <iframe 
            title="Compliance Dashboard" 
            className="w-full h-full"
            src="https://app.powerbi.com/view?r=eyJrIjoiMTJlZmJhOWUtMjMwOC00ZTM3LTk1MjctNjc3Njc1N2JmMThlIiwidCI6Ijg4ZjA3OTQ0LTY4MDYtNDQxMC04NjljLWY1MTFmYzQ1NzQzZiJ9&pageName=6ec8cf26dad2d397ed41" 
            frameBorder="0" 
            allowFullScreen={true}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ComplianceDashboard;
