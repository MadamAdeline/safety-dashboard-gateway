
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
import { Edit2, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@/types/user";
import { useToast } from "@/components/ui/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";

type UserWithRelations = Omit<User, 'manager'> & {
  user_roles?: {
    role_id: string;
    roles: {
      role_name: string;
    };
  }[];
  location?: {
    name: string;
    full_path: string;
  } | null;
};

interface UserListProps {
  onEdit: (user: UserWithRelations) => void;
  searchTerm: string;
  onNewUser: () => void;
}

export function UserList({ onEdit, searchTerm, onNewUser }: UserListProps) {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('Fetching users from Supabase...');
      try {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select(`
            *,
            user_roles (
              role_id,
              roles (
                role_name
              )
            ),
            location:locations (
              name,
              full_path
            )
          `);
        
        if (usersError) {
          console.error('Error fetching user details:', usersError);
          throw usersError;
        }

        console.log('Fetched users:', usersData);
        return usersData as UserWithRelations[];
      } catch (err) {
        console.error('Failed to fetch users:', err);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
        throw err;
      }
    }
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center">
        <div className="text-red-500">Error loading users. Please try again.</div>
      </div>
    );
  }

  const filteredUsers = users?.filter(user => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const email = user.email.toLowerCase();
    
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredUsers?.length || 0);
  const paginatedUsers = filteredUsers?.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil((filteredUsers?.length || 0) / itemsPerPage);
  const totalItems = filteredUsers?.length || 0;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F1F0FB] border-b border-gray-200">
              <TableHead className="text-dgxprt-navy font-semibold">Name</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Email</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Role</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Location</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Status</TableHead>
              <TableHead className="w-24 text-dgxprt-navy font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers?.map((user) => (
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
                    <Badge key={userRole.role_id} variant="outline">
                      {userRole.roles.role_name}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>
                  {user.location?.full_path || '-'}
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
                    {(user.active || 'inactive').toUpperCase()}
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

      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1} to {endIndex} of {totalItems} results
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={onNewUser}
              className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className={currentPage === page ? "bg-purple-600 text-white hover:bg-purple-500" : ""}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
