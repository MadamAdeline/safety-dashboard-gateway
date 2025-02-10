
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { useState } from "react";

export default function Landing() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-16">
          <img 
            src="/lovable-uploads/b45d40e4-978f-4fda-917b-2b29914ef272.png" 
            alt="DGXprt Logo" 
            className="h-12" 
          />
          <Button 
            onClick={() => setShowLoginDialog(true)}
            variant="outline"
            className="font-semibold"
          >
            Login
          </Button>
        </header>

        <main className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-dgxprt-navy mb-6">
            Workplace Hazardous Chemicals Management
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Empowering organizations with comprehensive Hazardous Chemicals Safety & Compliance. From SDS and Products Management to Inventory Management, Risk Assessments, and Waste Tracking - all in one platform.
          </p>
          <Button 
            onClick={() => setShowLoginDialog(true)}
            className="bg-dgxprt-purple hover:bg-dgxprt-purple/90 text-lg px-8 py-6 h-auto"
          >
            Login
          </Button>
        </main>

        <LoginDialog 
          open={showLoginDialog} 
          onOpenChange={setShowLoginDialog}
        />
      </div>
    </div>
  );
}
