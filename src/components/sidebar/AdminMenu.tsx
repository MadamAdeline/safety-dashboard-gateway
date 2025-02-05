import { Link } from "react-router-dom"
import { 
  Settings,
  FileText,
  Package,
  MapPin,
  Building2,
  Users,
  Database,
} from "lucide-react"
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

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

export function AdminMenu() {
  return (
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
  )
}