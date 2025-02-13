
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";

interface ProductHeaderProps {
  onNewProduct: () => void;
}

export function ProductHeader({ onNewProduct }: ProductHeaderProps) {
  const { data: userData } = useUserRole();
  const isManager = userData?.role?.toLowerCase() === 'manager';

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">Products</h1>
      {!isManager && (
        <Button 
          onClick={onNewProduct} 
          className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
        >
          <Plus className="mr-2 h-4 w-4" /> New Product
        </Button>
      )}
    </div>
  );
}
