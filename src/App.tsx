
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { ComingSoon } from "./components/ComingSoon";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  // Check if user is logged in (you can modify this based on your auth state management)
  const user = true; // For now, we'll assume the user is always logged in
  
  if (!user) {
    return <Navigate to="/" />;
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
            <Route path="/logout" element={<PrivateRoute><ComingSoon feature="Logout" /></PrivateRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);

export default App;
