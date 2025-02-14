
import { Button } from "@/components/ui/button";
import { Plus, Wand2 } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";

interface ProductHeaderProps {
  onNewProduct: () => void;
  onWizard: () => void;
}

export function ProductHeader({ onNewProduct, onWizard }: ProductHeaderProps) {
  const { data: userData } = useUserRole();
  const isAdmin = userData?.role?.toLowerCase() === 'administrator';

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">Products</h1>
      <div className="flex gap-2">
        {isAdmin && (
          <Button 
            onClick={onWizard}
            className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Product Setup Wizard
          </Button>
        )}
        <Button 
          onClick={onNewProduct}
          className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
        >
          <Plus className="mr-2 h-4 w-4" /> New Product
        </Button>
      </div>
    </div>
  );
}
