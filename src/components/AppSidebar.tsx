
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
} from "@/components/ui/sidebar"
import { MainMenu } from "./sidebar/MainMenu"
import { AdminMenu } from "./sidebar/AdminMenu"
import { UserFooter } from "./sidebar/UserFooter"
import { useQuery } from "@tanstack/react-query"
import { getSystemSettings } from "@/services/system-settings"
import { supabase } from "@/integrations/supabase/client"

export function AppSidebar() {
  const { data: settings } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: getSystemSettings
  });

  const logoUrl = settings?.logo_path
    ? supabase.storage.from('logos').getPublicUrl(settings.logo_path).data.publicUrl
    : "/lovable-uploads/1473d268-4b58-4028-8b1a-c70b45d4ec34.png";

  return (
    <Sidebar className="border-r border-gray-200 bg-dgxprt-sidebar">
      <div className="flex justify-center p-6">
        <img 
          src={logoUrl}
          alt="Company Logo" 
          className="h-12 object-contain" 
        />
      </div>
      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          <MainMenu />
          <AdminMenu />
        </SidebarGroup>
      </SidebarContent>
      <UserFooter />
    </Sidebar>
  )
}
