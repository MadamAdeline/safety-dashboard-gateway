
import { useUserRole } from "./use-user-role";

const routePermissions: Record<string, string[]> = {
  "/dashboard": ["standard", "manager", "administrator", "poweruser"],
  "/site-registers": ["standard", "manager", "administrator", "poweruser"],
  "/risk-assessments": ["standard", "manager", "administrator", "poweruser"],
  "/waste-tracking": ["standard", "manager", "administrator", "poweruser"],
  "/compliance": ["manager", "administrator", "poweruser"],
  "/sds-library": ["manager", "administrator", "poweruser"],
  "/products": ["manager", "administrator", "poweruser"],
  "/locations": ["administrator"],
  "/suppliers": ["administrator", "poweruser"],
  "/users": ["administrator"],
  "/master-data": ["administrator"],
  "/system-config": ["administrator"],
};

export function useRoutePermission(path: string) {
  const { data: userRole, isLoading } = useUserRole();
  
  if (isLoading) return { isLoading, hasPermission: false };
  
  // Extract the base path (e.g., /sds-library/new -> /sds-library)
  const basePath = "/" + path.split("/")[1];
  
  const allowedRoles = routePermissions[basePath] || [];
  const hasPermission = userRole?.role ? allowedRoles.includes(userRole.role.toLowerCase()) : false;

  return { isLoading, hasPermission };
}
