import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface UserActionsProps {
  onNewUser: () => void;
}

export function UserActions({ onNewUser }: UserActionsProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Users & Roles</h1>
      <Button 
        onClick={onNewUser}
        className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
      >
        <Plus className="mr-2 h-4 w-4" /> New User
      </Button>
    </div>
  );
}