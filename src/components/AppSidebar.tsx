import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
} from "@/components/ui/sidebar"
import { MainMenu } from "./sidebar/MainMenu"
import { AdminMenu } from "./sidebar/AdminMenu"
import { UserFooter } from "./sidebar/UserFooter"

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-gray-200 bg-dgxprt-sidebar">
      <div className="flex justify-center p-6">
        <img 
          src="/lovable-uploads/6601a49f-3b97-4eb4-a178-d1ae4eea2557.png" 
          alt="DGXprt Logo" 
          className="h-16" 
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