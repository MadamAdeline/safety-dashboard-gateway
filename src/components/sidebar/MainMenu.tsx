
import { Link } from "react-router-dom"
import { 
  Home, 
  ClipboardList, 
  AlertTriangle, 
  Trash2, 
  LineChart,
  Loader,
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
  const { data: userRole, isLoading, error } = useUserRole();

  console.log('User role:', userRole);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 text-white">
        <Loader className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (!userRole) {
    console.log('No user role found');
    return null;
  }

  const visibleItems = mainMenuItems.filter(item => 
    item.allowedRoles.includes(userRole.toLowerCase())
  );

  console.log('Visible items:', visibleItems);

  return (
    <>
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
    </>
  )
}
