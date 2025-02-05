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
    <Sidebar className="border-r border-gray-200">
      <div className="p-4">
        <img src="/lovable-uploads/6601a49f-3b97-4eb4-a178-d1ae4eea2557.png" alt="DGXprt Logo" className="h-12" />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <Link to={item.path} className="flex items-center gap-2">
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
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Administration
            </h2>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <Link to={item.path} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </div>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-4">
        <Link to="/logout" className="flex items-center gap-2 px-4 py-2 text-sm">
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Link>
      </div>
    </Sidebar>
  );
}