
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SDSLibrary from "./pages/SDSLibrary";
import Products from "./pages/Products";
import { NewSDSForm } from "./components/sds/NewSDSForm";
import ComplianceDashboard from "./pages/ComplianceDashboard";
import Locations from "./pages/Locations";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sds-library" element={<SDSLibrary />} />
          <Route path="/sds-library/new" element={<NewSDSForm onClose={() => window.history.back()} />} />
          <Route path="/compliance" element={<ComplianceDashboard />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/products" element={<Products />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
