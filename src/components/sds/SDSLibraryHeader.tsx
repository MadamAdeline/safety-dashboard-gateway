
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SDSLibraryHeaderProps {
  isAdmin: boolean;
  onNewSDS: () => void;
  onGlobalSearch: () => void;
}

export function SDSLibraryHeader({ isAdmin, onNewSDS, onGlobalSearch }: SDSLibraryHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">SDS Library</h1>
      <div className="flex gap-2">
        {isAdmin && (
          <>
            <Button 
              onClick={onGlobalSearch}
              className="bg-dgxprt-purple hover:bg-dgxprt-purple/90 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> SDS From Global Library
            </Button>
            <Button 
              onClick={onNewSDS}
              className="bg-dgxprt-purple hover:bg-dgxprt-purple/90 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> New SDS
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
