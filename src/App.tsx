
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SDSLibrary from "./pages/SDSLibrary";
import { NewSDSForm } from "./components/sds/NewSDSForm";
import ComplianceDashboard from "./pages/ComplianceDashboard";
import Locations from "./pages/Locations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sds-library" element={<SDSLibrary />} />
          <Route path="/sds-library/new" element={<NewSDSForm onClose={() => window.history.back()} />} />
          <Route path="/compliance" element={<ComplianceDashboard />} />
          <Route path="/locations" element={<Locations />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
