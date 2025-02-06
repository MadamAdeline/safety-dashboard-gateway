
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
import { Edit2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@/types/user";

interface UserListProps {
  onEdit: (user: User) => void;
}

type UserWithRelations = User & {
  user_roles?: {
    roles: {
      role_name: string;
    };
  }[];
  manager?: {
    first_name: string;
    last_name: string;
  } | null;
  location?: {
    name: string;
  } | null;
};

export function UserList({ onEdit }: UserListProps) {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_roles (
            roles (
              role_name
            )
          ),
          manager:users!users_manager_id_fkey (
            first_name,
            last_name
          ),
          location:locations (
            name
          )
        `);
      
      if (error) throw error;
      return data as UserWithRelations[];
    }
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F1F0FB] border-b border-gray-200">
            <TableHead className="text-dgxprt-navy font-semibold">Name</TableHead>
            <TableHead className="text-dgxprt-navy font-semibold">Email</TableHead>
            <TableHead className="text-dgxprt-navy font-semibold">Role</TableHead>
            <TableHead className="text-dgxprt-navy font-semibold">Manager</TableHead>
            <TableHead className="text-dgxprt-navy font-semibold">Location</TableHead>
            <TableHead className="text-dgxprt-navy font-semibold">Status</TableHead>
            <TableHead className="w-24 text-dgxprt-navy font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow 
              key={user.id}
              className="hover:bg-[#F1F0FB] transition-colors"
            >
              <TableCell className="font-medium text-dgxprt-navy">
                {user.first_name} {user.last_name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.user_roles?.map((userRole) => (
                  <Badge key={userRole.roles.role_name} variant="outline">
                    {userRole.roles.role_name}
                  </Badge>
                ))}
              </TableCell>
              <TableCell>
                {user.manager && `${user.manager.first_name} ${user.manager.last_name}`}
              </TableCell>
              <TableCell>
                {user.location?.name}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={user.active === 'active' ? "default" : "destructive"}
                  className={
                    user.active === 'active'
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }
                >
                  {user.active}
                </Badge>
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:bg-dgxprt-hover text-dgxprt-navy"
                  onClick={() => onEdit(user)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
