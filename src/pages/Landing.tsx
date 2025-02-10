
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
            src="/lovable-uploads/1473d268-4b58-4028-8b1a-c70b45d4ec34.png" 
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
            Safety Data Sheet Management
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Streamline your dangerous goods compliance with our comprehensive SDS management solution.
          </p>
          <Button 
            onClick={() => setShowLoginDialog(true)}
            className="bg-dgxprt-purple hover:bg-dgxprt-purple/90 text-lg px-8 py-6 h-auto"
          >
            Get Started
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
