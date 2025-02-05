import { Link } from "react-router-dom"
import { LogOut, Settings, Building2, Users2, FileText, Package, AlertTriangle } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

const adminItems = [
  {
    label: "Companies",
    path: "/companies",
    icon: Building2,
  },
  {
    label: "Users",
    path: "/users",
    icon: Users2,
  },
  {
    label: "Products",
    path: "/products",
    icon: Package,
  },
  {
    label: "Safety Data Sheets",
    path: "/sds",
    icon: FileText,
  },
  {
    label: "Expired SDS",
    path: "/expired-sds",
    icon: AlertTriangle,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-gray-200 bg-dgxprt-sidebar overflow-hidden">
      <div className="flex justify-center p-6">
        <img 
          src="/lovable-uploads/6601a49f-3b97-4eb4-a178-d1ae4eea2557.png" 
          alt="DGXprt Logo" 
          className="h-16" 
        />
      </div>
      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          <SidebarMenuItem>
            <SidebarMenuButton className="flex items-center gap-2 text-white font-bold hover:bg-dgxprt-hover hover:text-dgxprt-sidebar">
              <Settings className="h-4 w-4" />
              <span>Administration</span>
            </SidebarMenuButton>
            <div className="pl-4">
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.path} 
                      className="flex items-center gap-2 text-white font-bold hover:bg-dgxprt-hover hover:text-dgxprt-sidebar aria-[current=page]:bg-dgxprt-selected"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </div>
          </SidebarMenuItem>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-4">
        <Link 
          to="/logout" 
          className="flex items-center gap-2 px-4 py-2 text-sm text-white font-bold hover:bg-dgxprt-hover hover:text-dgxprt-sidebar rounded-md"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Link>
      </div>
    </Sidebar>
  )
}