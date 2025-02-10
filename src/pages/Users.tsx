
import { DashboardLayout } from "@/components/DashboardLayout";
import { UserList } from "@/components/users/UserList";
import { UserActions } from "@/components/users/UserActions";
import { UserForm } from "@/components/users/UserForm";
import { UserSearch } from "@/components/users/UserSearch";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { exportUsersToExcel } from "@/utils/userExport";
import type { User } from "@/types/user";

export default function Users() {
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const users = queryClient.getQueryData(['users']) as User[] || [];
      await exportUsersToExcel(users);
      toast({
        title: "Export Successful",
        description: "Users data has been exported to Excel."
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export users data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    toast({
      title: "Refreshing Data",
      description: "Updating the users list..."
    });
  };

  return (
    <DashboardLayout>
      {showNewUserForm || selectedUser ? (
        <UserForm
          onClose={() => {
            setShowNewUserForm(false);
            setSelectedUser(null);
          }}
          initialData={selectedUser}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Users & Roles</h1>
            <Button 
              onClick={() => setShowNewUserForm(true)}
              className="bg-dgxprt-purple hover:bg-dgxprt-purple/90 gap-2"
            >
              <Plus className="h-4 w-4" /> New User
            </Button>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <UserSearch 
              value={searchTerm}
              onChange={setSearchTerm}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleExport}
                className="gap-2"
                disabled={isExporting}
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export"}
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
          
          <UserList 
            onEdit={setSelectedUser}
            searchTerm={searchTerm}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
