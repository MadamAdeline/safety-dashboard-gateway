
import { Link } from "react-router-dom"
import { 
  Settings,
  FileText,
  Package,
  MapPin,
  Building2,
  Loader,
} from "lucide-react"
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { useUserRole } from "@/hooks/use-user-role"

const adminItems = [
  {
    label: "SDS Library",
    path: "/sds-library",
    icon: FileText,
    allowedRoles: ['manager', 'administrator'],
  },
  {
    label: "Products",
    path: "/products",
    icon: Package,
    allowedRoles: ['manager', 'administrator'],
  },
  {
    label: "Locations",
    path: "/locations",
    icon: MapPin,
    allowedRoles: ['administrator'],
  },
  {
    label: "Suppliers",
    path: "/suppliers",
    icon: Building2,
    allowedRoles: ['administrator'],
  },
]

export function AdminMenu() {
  const { data: userData, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 text-white">
        <Loader className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (!userData?.role) return null;

  const visibleItems = adminItems.filter(item => 
    item.allowedRoles.includes(userData.role.toLowerCase())
  );

  if (visibleItems.length === 0) return null;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton className="flex items-center gap-2 text-white font-bold hover:bg-dgxprt-hover hover:text-dgxprt-sidebar text-lg">
        <Settings className="h-4 w-4" />
        <span>Administration</span>
      </SidebarMenuButton>
      <div className="pl-4">
        {visibleItems.map((item) => (
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
