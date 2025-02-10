
import { useNavigate } from "react-router-dom"
import { LogOut, User } from "lucide-react"
import { SidebarFooter } from "@/components/ui/sidebar"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"

export function UserFooter() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: userData, error } = await supabase
        .from('users')
        .select('first_name, email')
        .eq('email', localStorage.getItem('userEmail'))
        .single();
        
      if (error) {
        console.error('Error fetching user data:', error);
        throw error;
      }
      
      return userData;
    }
  });

  const handleLogout = async () => {
    try {
      localStorage.removeItem('userEmail');
      
      toast({
        title: "Success",
        description: "You have been logged out successfully"
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <SidebarFooter className="mt-auto border-t border-dgxprt-sidebar p-4">
      <div className="flex items-center gap-2 px-2 py-2 text-white">
        <User className="h-4 w-4" />
        <span className="font-medium">
          {isLoading ? 'Loading...' : (user?.first_name || 'User')}
        </span>
      </div>
      <button 
        onClick={handleLogout}
        className="flex w-full items-center gap-2 px-2 py-2 text-white font-medium hover:bg-dgxprt-hover hover:text-dgxprt-sidebar rounded-md"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </button>
    </SidebarFooter>
  );
}
