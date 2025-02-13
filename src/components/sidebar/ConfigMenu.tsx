
import { Link } from "react-router-dom"
import { 
  Users,
  Database,
  Cog,
} from "lucide-react"
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { useUserRole } from "@/hooks/use-user-role"

const configItems = [
  {
    label: "Users & Roles",
    path: "/users",
    icon: Users,
    allowedRoles: ['administrator'],
  },
  {
    label: "Master Data",
    path: "/master-data",
    icon: Database,
    allowedRoles: ['administrator'],
  },
  {
    label: "System Config",
    path: "/system-config",
    icon: Cog,
    allowedRoles: ['administrator'],
  },
]

export function ConfigMenu() {
  const { data: userData, isLoading } = useUserRole();

  if (isLoading || !userData?.role) return null;

  const visibleItems = configItems.filter(item => 
    item.allowedRoles.includes(userData.role.toLowerCase())
  );

  if (visibleItems.length === 0) return null;

  return (
    <div className="flex flex-col space-y-0">
      <SidebarMenuItem className="py-0.5">
        <SidebarMenuButton className="flex items-center gap-2 text-white font-bold hover:bg-dgxprt-hover hover:text-dgxprt-sidebar text-lg px-4 py-1.5">
          <span>Configuration</span>
        </SidebarMenuButton>
        <div className="flex flex-col space-y-0 pl-4">
          {visibleItems.map((item) => (
            <SidebarMenuItem key={item.label} className="py-0.5">
              <SidebarMenuButton asChild>
                <Link 
                  to={item.path} 
                  className="flex items-center gap-2 text-white font-bold hover:bg-dgxprt-hover hover:text-dgxprt-sidebar aria-[current=page]:bg-dgxprt-selected px-4 py-1.5"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </div>
      </SidebarMenuItem>
    </div>
  )
}
