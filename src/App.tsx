
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { StrictMode } from "react";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import SDSLibrary from "./pages/SDSLibrary";
import Products from "./pages/Products";
import { NewSDSForm } from "./components/sds/NewSDSForm";
import ComplianceDashboard from "./pages/ComplianceDashboard";
import Locations from "./pages/Locations";
import Suppliers from "./pages/Suppliers";
import MasterData from "./pages/MasterData";
import Users from "./pages/Users";
import SiteRegisters from "./pages/SiteRegisters";
import RiskAssessments from "./pages/RiskAssessments";
import WasteTracking from "./pages/WasteTracking";
import { AccessDeniedDialog } from "./components/auth/AccessDeniedDialog";
import { useRoutePermission } from "./hooks/use-route-permission";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const userEmail = localStorage.getItem('userEmail');
  const { isLoading, hasPermission } = useRoutePermission(location.pathname);
  
  // Check if user is logged in
  if (!userEmail) {
    return <Navigate to="/" />;
  }
  
  // Show loading state while checking permissions
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // Show access denied dialog if user doesn't have permission
  if (!hasPermission) {
    return <AccessDeniedDialog />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Landing page as the default route */}
            <Route path="/" element={<Landing />} />
            {/* Protected dashboard route */}
            <Route path="/dashboard" element={<PrivateRoute><Index /></PrivateRoute>} />
            <Route path="/sds-library" element={<PrivateRoute><SDSLibrary /></PrivateRoute>} />
            <Route path="/sds-library/new" element={<PrivateRoute><NewSDSForm onClose={() => window.history.back()} /></PrivateRoute>} />
            <Route path="/compliance" element={<PrivateRoute><ComplianceDashboard /></PrivateRoute>} />
            <Route path="/locations" element={<PrivateRoute><Locations /></PrivateRoute>} />
            <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
            <Route path="/suppliers" element={<PrivateRoute><Suppliers /></PrivateRoute>} />
            <Route path="/master-data" element={<PrivateRoute><MasterData /></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
            <Route path="/site-registers" element={<PrivateRoute><SiteRegisters /></PrivateRoute>} />
            <Route path="/risk-assessments" element={<PrivateRoute><RiskAssessments /></PrivateRoute>} />
            <Route path="/waste-tracking" element={<PrivateRoute><WasteTracking /></PrivateRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);

export default App;
