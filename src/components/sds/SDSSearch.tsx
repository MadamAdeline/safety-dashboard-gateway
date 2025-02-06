import { useActiveSDSList } from "@/hooks/use-active-sds-list";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SDS } from "@/types/sds";

interface SDSSearchProps {
  selectedSdsId?: string;
  onSDSSelect: (sds: SDS) => void;
}

export function SDSSearch({ selectedSdsId, onSDSSelect }: SDSSearchProps) {
  const { data: sdsData = [], isLoading } = useActiveSDSList();

  return (
    <Command className="w-[400px] bg-white border rounded-lg">
      <CommandInput placeholder="Search SDS..." />
      <CommandEmpty>No SDS found.</CommandEmpty>
      <CommandGroup className="max-h-[300px] overflow-auto">
        {sdsData.map((sds) => (
          <CommandItem
            key={sds.id}
            value={sds.productName}
            onSelect={() => onSDSSelect(sds)}
            className="cursor-pointer"
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                selectedSdsId === sds.id ? "opacity-100" : "opacity-0"
              )}
            />
            {sds.productName}
          </CommandItem>
        ))}
      </CommandGroup>
    </Command>
  );
}