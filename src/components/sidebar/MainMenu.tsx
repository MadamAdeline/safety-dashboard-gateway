
import { Link } from "react-router-dom"
import { 
  Home, 
  ClipboardList, 
  AlertTriangle, 
  Trash2, 
  LineChart,
} from "lucide-react"
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { useUserRole } from "@/hooks/use-user-role"

const mainMenuItems = [
  {
    label: "Home",
    path: "/dashboard",
    icon: Home,
    allowedRoles: ['standard', 'manager', 'administrator'],
  },
  {
    label: "Site Registers",
    path: "/site-registers",
    icon: ClipboardList,
    allowedRoles: ['standard', 'manager', 'administrator'],
  },
  {
    label: "Risk Assessments",
    path: "/risk-assessments",
    icon: AlertTriangle,
    allowedRoles: ['standard', 'manager', 'administrator'],
  },
  {
    label: "Waste Tracking",
    path: "/waste-tracking",
    icon: Trash2,
    allowedRoles: ['standard', 'manager', 'administrator'],
  },
  {
    label: "Compliance Dashboard",
    path: "/compliance",
    icon: LineChart,
    allowedRoles: ['manager', 'administrator'],
  },
]

export function MainMenu() {
  const { data: userRole, isLoading } = useUserRole();

  if (isLoading) return null;

  return (
    <>
      {mainMenuItems
        .filter(item => item.allowedRoles.includes(userRole as string))
        .map((item) => (
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
    </>
  )
}
