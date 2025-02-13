
import { DashboardLayout } from "@/components/DashboardLayout";
import { SystemConfigForm } from "@/components/system-config/SystemConfigForm";

export default function SystemConfig() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">System Configuration</h1>
        <SystemConfigForm />
      </div>
    </DashboardLayout>
  );
}
