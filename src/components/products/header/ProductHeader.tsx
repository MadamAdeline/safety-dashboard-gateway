
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProductHeaderProps {
  onNewProduct: () => void;
}

export function ProductHeader({ onNewProduct }: ProductHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">Products</h1>
      <Button 
        onClick={onNewProduct} 
        className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
      >
        <Plus className="mr-2 h-4 w-4" /> New Product
      </Button>
    </div>
  );
}
