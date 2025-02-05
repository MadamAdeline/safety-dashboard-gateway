import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, FileText, AlertTriangle, LayoutDashboard, Settings, LogOut, Package, MapPin, Truck, Users, Database } from "lucide-react";
import { Link } from "react-router-dom";

const menuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: FileText, label: "Site Registers", path: "/registers" },
  { icon: AlertTriangle, label: "Risk Assessment", path: "/risk" },
  { icon: Package, label: "Waste Tracking", path: "/waste" },
  { icon: LayoutDashboard, label: "Compliance Dashboard", path: "/compliance" },
];

const adminItems = [
  { icon: FileText, label: "SDS Library", path: "/sds" },
  { icon: Package, label: "Products", path: "/products" },
  { icon: MapPin, label: "Locations", path: "/locations" },
  { icon: Truck, label: "Suppliers", path: "/suppliers" },
  { icon: Users, label: "Users & Roles", path: "/users" },
  { icon: Database, label: "Master Data", path: "/master-data" },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-gray-200 bg-dgxprt-sidebar">
      <div className="flex justify-center p-6">
        <img src="/lovable-uploads/6601a49f-3b97-4eb4-a178-d1ae4eea2557.png" alt="DGXprt Logo" className="h-16" />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenuItem>
            <SidebarMenuButton className="flex items-center gap-2 text-white font-bold hover:bg-dgxprt-hover hover:text-dgxprt-sidebar">
              <Settings className="h-4 w-4" />
              <span>Administration</span>
            </SidebarMenuButton>
            <SidebarMenu className="ml-4 mt-2">
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
            </SidebarMenu>
          </SidebarMenuItem>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-4">
        <Link to="/logout" className="flex items-center gap-2 px-4 py-2 text-sm text-white font-bold hover:bg-dgxprt-hover hover:text-dgxprt-sidebar rounded-md">
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Link>
      </div>
    </Sidebar>
  );
}