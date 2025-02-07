
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
          src="/lovable-uploads/1473d268-4b58-4028-8b1a-c70b45d4ec34.png" 
          alt="DGXprt Logo" 
          className="h-12" 
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
