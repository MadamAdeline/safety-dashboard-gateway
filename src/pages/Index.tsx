
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { ArrowRight } from "lucide-react";

const LandingPage = () => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "10K+", label: "Chemicals" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dgxprt-navy">DGXpert</h1>
        <Button 
          variant="outline" 
          onClick={() => setShowLoginDialog(true)}
          className="gap-2"
        >
          Login
        </Button>
      </header>

      <main className="container mx-auto px-4 text-center pt-20 pb-16">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-dgxprt-purple">Dangerous Goods</span>
          <br />
          <span className="text-dgxprt-navy">Safety & Compliance</span>
        </h1>
        
        <p className="max-w-3xl mx-auto text-gray-600 text-lg mb-12">
          Empowering organizations with comprehensive dangerous goods management solutions. 
          From SDS management to risk assessments, waste tracking, and site registers - all in one platform.
        </p>

        <Button 
          size="lg"
          onClick={() => setShowLoginDialog(true)}
          className="bg-dgxprt-purple hover:bg-dgxprt-purple/90 text-white px-8 py-6 text-lg gap-2"
        >
          Get Started <ArrowRight className="h-5 w-5" />
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {stats.map((stat) => (
            <div key={stat.label} className="p-6">
              <div className="text-4xl font-bold text-dgxprt-purple mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      <LoginDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog} 
      />
    </div>
  );
};

export default LandingPage;
