
import { useUserRole } from "./use-user-role";

const routePermissions: Record<string, string[]> = {
  "/dashboard": ["standard", "manager", "administrator"],
  "/site-registers": ["standard", "manager", "administrator"],
  "/risk-assessments": ["standard", "manager", "administrator"],
  "/waste-tracking": ["standard", "manager", "administrator"],
  "/compliance": ["manager", "administrator"],
  "/sds-library": ["manager", "administrator"],
  "/products": ["manager", "administrator"],
  "/locations": ["administrator"],
  "/suppliers": ["administrator"],
  "/users": ["administrator"],
  "/master-data": ["administrator"],
};

export function useRoutePermission(path: string) {
  const { data: userRole, isLoading } = useUserRole();
  
  if (isLoading) return { isLoading, hasPermission: false };
  
  // Extract the base path (e.g., /sds-library/new -> /sds-library)
  const basePath = "/" + path.split("/")[1];
  
  const allowedRoles = routePermissions[basePath] || [];
  const hasPermission = userRole ? allowedRoles.includes(userRole.toLowerCase()) : false;

  return { isLoading, hasPermission };
}
