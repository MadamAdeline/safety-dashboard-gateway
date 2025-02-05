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

export function MainMenu() {
  return (
    <>
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
    </>
  )
}