import { Link } from "react-router-dom"
import { 
  Home, 
  ClipboardList, 
  AlertTriangle, 
  Trash2, 
  LineChart,
  Settings,
  FileText,
  Package,
  MapPin,
  Building2,
  Users,
  Database,
  LogOut,
  User
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"

const mainMenuItems = [
  {
    label: "Home",
    path: "/",
    icon: Home,
  },
  {
    label: "Site Registers",
    path: "/site-registers",
    icon: ClipboardList,
  },
  {
    label: "Risk Assessments",
    path: "/risk-assessments",
    icon: AlertTriangle,
  },
  {
    label: "Waste Tracking",
    path: "/waste-tracking",
    icon: Trash2,
  },
  {
    label: "Compliance Dashboard",
    path: "/compliance",
    icon: LineChart,
  },
]

const adminItems = [
  {
    label: "SDS Library",
    path: "/sds-library",
    icon: FileText,
  },
  {
    label: "Products",
    path: "/products",
    icon: Package,
  },
  {
    label: "Locations",
    path: "/locations",
    icon: MapPin,
  },
  {
    label: "Suppliers",
    path: "/suppliers",
    icon: Building2,
  },
  {
    label: "Users & Roles",
    path: "/users",
    icon: Users,
  },
  {
    label: "Master Data",
    path: "/master-data",
    icon: Database,
  },
]

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
          {mainMenuItems.map((item) => (
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
      
      <SidebarFooter className="mt-auto border-t border-dgxprt-sidebar p-4">
        <div className="flex items-center gap-2 px-2 py-2 text-white">
          <User className="h-4 w-4" />
          <span className="font-medium">John Doe</span>
        </div>
        <Link 
          to="/logout" 
          className="flex items-center gap-2 px-2 py-2 text-white font-medium hover:bg-dgxprt-hover hover:text-dgxprt-sidebar rounded-md"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}